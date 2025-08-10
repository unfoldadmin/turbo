# Development stage
FROM node:21

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

RUN npm install -g pnpm

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./

# Устанавливаем все зависимости
RUN pnpm install

# Копируем остальные файлы проекта
COPY . .

EXPOSE 3000

# Запускаем приложение в dev режиме (запускаем next напрямую, чтобы корректно передать флаги)
CMD ["pnpm", "exec", "next", "dev", "--turbo", "--hostname", "0.0.0.0"]
