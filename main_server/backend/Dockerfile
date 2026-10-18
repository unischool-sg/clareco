FROM docker.io/library/python:3.12-slim AS deps
COPY --from=ghcr.io/astral-sh/uv:0.13.0 /uv /usr/local/bin/uv
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV UV_PYTHON_DOWNLOADS=never \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
WORKDIR /srv/backend
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev

FROM docker.io/library/python:3.12-slim

COPY --from=docker.io/mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/ffmpeg
COPY --from=docker.io/mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/ffprobe
COPY --from=deps /srv/backend/.venv /srv/backend/.venv
COPY app /srv/backend/app

ARG UID=1000
RUN useradd --system --no-create-home --uid ${UID} clareco
USER clareco

WORKDIR /srv/backend/app
ENV PATH=/srv/backend/.venv/bin:$PATH
