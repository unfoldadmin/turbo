FROM python:3.13-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/.venv \
    PATH="/.venv/bin:$PATH"

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install uv && \
    uv venv && \
    uv sync

# Copy application source (including bin/ scripts) into the image for worker/beat
COPY . .

# Ensure entrypoint scripts are executable inside the image
RUN chmod +x /app/bin/*.sh

EXPOSE 8000
