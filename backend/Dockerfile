FROM python:3.13-slim-bookworm

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN pip install poetry

RUN poetry config virtualenvs.create false

RUN poetry install --no-root

EXPOSE 8000
