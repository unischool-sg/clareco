import base64
import hashlib
import secrets
from typing import Annotated
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import RedirectResponse
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token

from common.config import (
    GOOGLE_AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_HD,
    GOOGLE_REDIRECT_URI,
    GOOGLE_TOKEN_TIMEOUT,
    GOOGLE_TOKEN_URL,
    LOGIN_REDIRECT_URL,
    OAUTH_STATE_MAX_AGE,
    SESSION_COOKIE,
    SESSION_HOURS,
    STATE_COOKIE,
    STATE_COOKIE_PATH,
    TOKEN_BYTES,
)
from common.db import add_session, claim_login, find_login_user, read, revoke_session
from common.models import SessionUser
from common.security import gen_session_token, hash_token
from teacher.auth import verify_session
from teacher.tx import as_user, run

router = APIRouter()


def _code_challenge(verifier: str) -> str:
    return (
        base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    )


def _safe_next(next_url: str | None) -> str:
    if (
        not next_url
        or not next_url.startswith("/")
        or next_url.startswith("//")
        or any(c == "\\" or not c.isprintable() for c in next_url)
    ):
        return LOGIN_REDIRECT_URL
    return next_url


def _fetch_id_token_claims(code: str, verifier: str) -> dict:
    res = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
            "code_verifier": verifier,
        },
        timeout=GOOGLE_TOKEN_TIMEOUT,
    )
    res.raise_for_status()
    return id_token.verify_oauth2_token(res.json()["id_token"], GoogleRequest(), GOOGLE_CLIENT_ID)


def _start_session(google_sub: str, email: str, display_name: str | None) -> str | None:
    with read() as conn:
        user_id = find_login_user(conn, google_sub, email)
    if user_id is None:
        return None
    token = gen_session_token()
    with as_user(user_id) as conn:
        if not claim_login(conn, user_id, google_sub, display_name):
            return None
        add_session(conn, hash_token(token), user_id, SESSION_HOURS)
    return token


@router.get("/api/auth/login")
async def login(next: str | None = None):
    state, nonce, verifier = (secrets.token_urlsafe(TOKEN_BYTES) for _ in range(3))
    next_b64 = base64.urlsafe_b64encode(_safe_next(next).encode()).decode()
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "nonce": nonce,
        "code_challenge": _code_challenge(verifier),
        "code_challenge_method": "S256",
        "hd": GOOGLE_HD,
        "prompt": "select_account",
    }
    res = RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}", status.HTTP_302_FOUND)
    res.set_cookie(
        STATE_COOKIE,
        f"{state}.{nonce}.{verifier}.{next_b64}",
        max_age=OAUTH_STATE_MAX_AGE,
        path=STATE_COOKIE_PATH,
        secure=True,
        httponly=True,
        samesite="lax",
    )
    return res


@router.get("/api/auth/callback")
async def callback(
    code: str | None = None,
    state: str | None = None,
    oauth_state: Annotated[str | None, Cookie(alias=STATE_COOKIE)] = None,
):
    try:
        saved_state, nonce, verifier, next_b64 = (oauth_state or "").split(".")
        next_url = _safe_next(base64.urlsafe_b64decode(next_b64).decode())
    except ValueError:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Login session expired; try again"
        ) from None
    if not code or not state or not secrets.compare_digest(state, saved_state):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid login state")

    try:
        claims = await run_in_threadpool(_fetch_id_token_claims, code, verifier)
    except (requests.RequestException, KeyError, ValueError, GoogleAuthError) as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google login failed") from e

    if not secrets.compare_digest(claims.get("nonce", ""), nonce):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid nonce")
    if claims.get("hd") != GOOGLE_HD or claims.get("email_verified") is not True:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This Google account is not allowed")

    token = await run_in_threadpool(
        _start_session, claims["sub"], claims["email"].lower(), claims.get("name")
    )
    if token is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This Google account is not registered")

    res = RedirectResponse(next_url, status.HTTP_302_FOUND)
    res.delete_cookie(
        STATE_COOKIE, path=STATE_COOKIE_PATH, secure=True, httponly=True, samesite="lax"
    )
    res.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_HOURS * 3600,
        path="/",
        secure=True,
        httponly=True,
        samesite="strict",
    )
    return res


@router.post("/api/auth/logout")
async def logout(
    response: Response,
    user: Annotated[SessionUser, Depends(verify_session)],
    session: Annotated[str, Cookie(alias=SESSION_COOKIE)],
):
    await run(as_user(user.id), revoke_session, hash_token(session))
    response.delete_cookie(SESSION_COOKIE, path="/", secure=True, httponly=True, samesite="strict")
    return {"logged_out": True}


@router.get("/api/auth/me", response_model=SessionUser)
async def me(user: Annotated[SessionUser, Depends(verify_session)]):
    return user
