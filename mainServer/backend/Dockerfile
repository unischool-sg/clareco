FROM ghcr.io/astral-sh/uv:python3.12-bookworm AS deps
ENV UV_PYTHON_DOWNLOADS=never \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
WORKDIR /srv/backend
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev

FROM docker.io/library/python:3.12-slim

COPY --from=docker.io/mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/ffprobe
COPY --from=deps /srv/backend/.venv /srv/backend/.venv
COPY app /srv/backend/app

ARG UID=1000
RUN useradd --system --no-create-home --uid ${UID} classee
USER classee

WORKDIR /srv/backend/app
ENV PATH=/srv/backend/.venv/bin:$PATH
