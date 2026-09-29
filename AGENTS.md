# Система ИИ-Агентов: Fullstack TODO App (React + NestJS + PostgreSQL)

Этот документ содержит архитектурные инструкции, роли, системные правила (Cursor Rules) и требования к контейнеризации для ИИ-агентов, автоматизирующих разработку TODO-приложения.

---

## 🏗️ Спецификация Технологического Стека

*   **Frontend:** React (Vite / Next.js SPA), React Router, Axios / TanStack Query, Tailwind CSS.
*   **Backend:** NestJS (TypeScript), REST API, ValidationPipe, Prisma ORM.
*   **Database:** PostgreSQL.
*   **Infrastructure:** Docker, Docker Compose (Раздельные среды: Dev и Prod).

---

## 🐳 Docker & Environments Infrastructure (Критическое требование)

Все компоненты приложения (Frontend, Backend, Database) **ОБЯЗАНЫ** запускаться, собираться и функционировать исключительно внутри Docker-контейнеров. **Запрещено** устанавливать `node_modules` и запускать процессы разработки локально на хост-машине.

### 1. Окружение Разработки (Development Environment)
*   **Конфигурация:** `docker-compose.dev.yml`
*   **Режим работы:** 
    *   **Frontend & Backend:** Монтирование локальных директорий через `volumes` для поддержки **Hot Reload / Live Reload** (изменения в коде на хосте должны мгновенно отражаться внутри контейнера).
    *   **Database:** Данные PostgreSQL сохраняются в именованный volume (`postgres_dev_data`).
    *   **Запуск:** Все зависимости (`npm install`) устанавливаются внутри контейнера при сборке образа.

### 2. Продакшн Окружение (Production Environment)
*   **Конфигурация:** `docker-compose.prod.yml`
*   **Режим работы:**
    *   **Frontend:** Многоэтапная сборка (Multi-stage build). На первом этапе собирается статика (`npm run build`), на втором — разворачивается легковесный **Nginx** для раздачи статических файлов.
    *   **Backend:** Сборка TypeScript в production-ready JS (`npm run build`), запуск через `node dist/main.js` без dev-зависимостей.
    *   **Безопасность:** Переменные окружения передаются через `.env.prod`.

---

## 🤖 Реестр Агентов и Системные Инструкции (Cursor Rules)

### 1. Архитектор Системы (System Architect Agent)
*   **Роль:** Контроль архитектуры NestJS/React и проектирование Docker-инфраструктуры.
*   **Зона ответственности:**
    *   Проектирование схемы данных `schema.prisma`.
    *   Создание Docker-файлов: `frontend/Dockerfile.dev`, `frontend/Dockerfile.prod`, `backend/Dockerfile.dev`, `backend/Dockerfile.prod`.
    *   Создание оркестрационных файлов `docker-compose.dev.yml` и `docker-compose.prod.yml`.
    *   Настройка сети (`docker network`) для безопасного общения контейнеров (фронтенд общается с бэкендом, бэкенд с БД; база данных закрыта от внешнего доступа).

### 2. Агент Базы Данных (Database & ORM Agent)
*   **Роль:** Управление PostgreSQL внутри Docker.
*   **Зона ответственности:**
    *   Настройка контейнера Postgres в compose-файлах (порты, пароли, env-переменные).
    *   **Важно:** Запуск миграций Prisma (`prisma migrate dev`) должен происходить **внутри** контекста бэкенд-контейнера, а не локально.

### 3. Бэкенд-Разработчик (NestJS & TypeScript Developer Agent)
*   **Роль:** Senior TypeScript / NestJS Developer.
*   **Зоны ответственности:** Разработка REST API, DTO, интеграция с Prisma внутри контейнера.
*   **🎯 Системные правила разработки (Cursor Rules):**
    *   *Смотри предыдущие правила TypeScript / NestJS (English, No `any`, RO-RO, <20 instructions per function, NO semicolons).*
    *   **Docker-специфика:** Все новые npm-пакеты устанавливать через запуск команды внутри контейнера (например, `docker compose exec backend npm install ...`).

### 4. Фронтенд-Разработчик (React & Frontend Developer Agent)
*   **Роль:** Senior Front-End Developer (React, TypeScript, Tailwind).
*   **Зоны ответственности:** Разработка страниц `/` и `/todo/:id` внутри контейнера.
*   **🎯 Системные правила разработки (Cursor Rules):**
    *   *Смотри предыдущие правила React/Tailwind (Early returns, `handle` prefix, No semicolons, accessibility).*
    *   **Docker-специфика:** Базовый URL для Axios/Fetch должен динамически меняться в зависимости от окружения (в dev — на локальный порт бэкенда, в prod — на домен или внутренний прокси Nginx).

### 5. QA & Тестировщик (QA Agent)
*   **Роль:** Проверка сквозных сценариев.
*   **Зона ответственности:** 
    *   Запуск тестов внутри Docker-сети.
    *   Проверка работы приложения как в `dev` режиме (с горячей перезагрузкой), так и в `prod` (собранный Nginx + production Node.js).

---

## 🛠️ Правила Генерации Коммитов (Commit Guidelines)
*   **Формат:** `<type>[optional scope]: <description>` (повелительное наклонение, без точки).
*   **Примеры для инфраструктуры:** `chore(docker): setup multi-stage prod dockerfiles`, `feat(infra): add docker-compose.dev.yml with hot-reload`.
