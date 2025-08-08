SHELL := /bin/bash

# Настройки
COMPOSE ?= docker compose
SERVICE ?=
APP ?=
ARGS ?=

.PHONY: help up down restart ps logs build pull clean reset \
        api-shell migrate makemigrations collectstatic superuser test \
        web-install web-dev openapi

.DEFAULT_GOAL := help

help: ## Показать это сообщение помощи
	@echo "Доступные команды:"
	@echo "  make up                 - Поднять все сервисы в фоне"
	@echo "  make down               - Остановить и удалить контейнеры"
	@echo "  make restart [SERVICE=] - Перезапустить (все или указанный сервис)"
	@echo "  make ps                 - Статус контейнеров"
	@echo "  make logs [SERVICE=]    - Логи (всех или указанного сервиса)"
	@echo "  make build [SERVICE=]   - Сборка образов"
	@echo "  make pull [SERVICE=]    - Обновить образы"
	@echo "  make clean              - Остановить и удалить осиротевшие контейнеры"
	@echo "  make reset              - Полная очистка: контейнеры + тома"
	@echo "  make migrate [ARGS=]    - Django migrate"
	@echo "  make makemigrations APP=имя [ARGS=] - Django makemigrations"
	@echo "  make api-shell          - Открыть Django shell в контейнере api"
	@echo "  make superuser [ARGS=]  - Создать суперпользователя"
	@echo "  make collectstatic      - Собрать статику"
	@echo "  make test [ARGS=]       - Запустить тесты бэкенда (pytest)"
	@echo "  make web-install        - pnpm install -r во фронтенде"
	@echo "  make web-dev            - Запустить фронтенд dev-сервер"
	@echo "  make openapi            - Сгенерировать типы OpenAPI во фронтенде"

# Базовые операции с docker compose
up: ## Поднять все сервисы (в фоне)
	$(COMPOSE) up -d

down: ## Остановить и удалить контейнеры
	$(COMPOSE) down

restart: ## Перезапустить сервис(ы). Пример: make restart SERVICE=api
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE) restart $(SERVICE); \
	else \
		$(COMPOSE) restart; \
	fi

ps: ## Показать статус контейнеров
	$(COMPOSE) ps

logs: ## Поток логов. Пример: make logs SERVICE=api
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE) logs -f $(SERVICE); \
	else \
		$(COMPOSE) logs -f; \
	fi

build: ## Сборка образов
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE) build $(SERVICE); \
	else \
		$(COMPOSE) build; \
	fi

pull: ## Обновить образы из реестра
	@if [ -n "$(SERVICE)" ]; then \
		$(COMPOSE) pull $(SERVICE); \
	else \
		$(COMPOSE) pull; \
	fi

clean: ## Остановить и удалить осиротевшие контейнеры/сети
	$(COMPOSE) down --remove-orphans

reset: ## Полная очистка: контейнеры + тома
	$(COMPOSE) down -v --remove-orphans

# Бэкенд (Django / uv) — выполняется в контейнере api
api-shell: ## Открыть Django shell
	$(COMPOSE) exec api bash -lc "uv run -- python manage.py shell"

migrate: ## Выполнить миграции
	$(COMPOSE) exec api bash -lc "uv run -- python manage.py migrate $(ARGS)"

makemigrations: ## Создать миграции для приложения: make makemigrations APP=app_name
	@if [ -z "$(APP)" ]; then \
		echo "Укажите APP=имя_приложения"; exit 1; \
	fi
	$(COMPOSE) exec api bash -lc "uv run -- python manage.py makemigrations $(APP) $(ARGS)"

superuser: ## Создать суперпользователя
	$(COMPOSE) exec api bash -lc "uv run -- python manage.py createsuperuser $(ARGS)"

collectstatic: ## Собрать статику
	$(COMPOSE) exec api bash -lc "uv run -- python manage.py collectstatic --noinput"

test: ## Запустить тесты (pytest)
	$(COMPOSE) exec api bash -lc "uv run -- pytest -q $(ARGS)"

# Фронтенд (pnpm) — выполняется в контейнере web
web-install: ## Установка зависимостей (pnpm -r)
	$(COMPOSE) exec web bash -lc "pnpm install -r"

web-dev: ## Запуск dev-сервера фронтенда
	$(COMPOSE) exec web bash -lc "pnpm --filter web dev"

openapi: ## Генерация типов OpenAPI во фронтенде
	$(COMPOSE) exec web bash -lc "pnpm run openapi:generate"


