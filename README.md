# TODO Service - Fullstack Application

Fullstack TODO приложение с использованием React, NestJS и PostgreSQL, полностью контейнеризованное с Docker.

## 🏗️ Технологический Стек

- **Frontend:** React + Vite, TypeScript, Tailwind CSS, React Router
- **Backend:** NestJS, TypeScript, Prisma ORM, REST API
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker, Docker Compose

## 🚀 Быстрый Старт (Development)

### Предварительные Требования
- Docker Desktop (или Docker Engine + Docker Compose)
- Git

### Запуск Development Окружения

1. **Клонирование репозитория:**
   ```bash
   git clone <repository-url>
   cd Todo_service
   ```

2. **Запуск всех сервисов:**
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. **Доступ к приложению:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432

### 🔄 Hot Reload

Все изменения в коде автоматически отслеживаются:
- **Frontend:** Vite HMR перезагружает компоненты
- **Backend:** NestJS watch mode перезапускает сервер
- **Database:** Данные сохраняются в именованном volume

### 📦 Установка Новых Пакетов

**НЕ устанавливайте пакеты локально!** Все зависимости управляются внутри контейнеров:

**Backend:**
```bash
docker compose -f docker-compose.dev.yml exec backend npm install <package-name>
docker compose -f docker-compose.dev.yml restart backend
```

**Frontend:**
```bash
docker compose -f docker-compose.dev.yml exec frontend npm install <package-name>
docker compose -f docker-compose.dev.yml restart frontend
```

### 🗄️ Prisma Migrations

Запуск миграций внутри контейнера:
```bash
# Создание миграции
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name init

# Применение миграций
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# Генерация Prisma Client
docker compose -f docker-compose.dev.yml exec backend npx prisma generate

# Prisma Studio
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```

### 🛑 Остановка Сервисов

```bash
# Остановка без удаления данных
docker compose -f docker-compose.dev.yml down

# Остановка с удалением volumes (очистка БД)
docker compose -f docker-compose.dev.yml down -v
```

## 📁 Структура Проекта

```
Todo_service/
├── frontend/              # React приложение
│   ├── Dockerfile.dev     # Dev образ с Hot Reload
│   ├── src/               # Исходники
│   └── package.json
├── backend/               # NestJS API
│   ├── Dockerfile.dev     # Dev образ
│   ├── src/               # Исходники
│   ├── prisma/            # Схема БД и миграции
│   └── package.json
├── docker-compose.dev.yml # Оркестрация dev-окружения
└── .env.dev               # Переменные окружения
```

## 🔧 Полезные Команды

```bash
# Просмотр логов
docker compose -f docker-compose.dev.yml logs -f [service-name]

# Перезапуск отдельного сервиса
docker compose -f docker-compose.dev.yml restart [service-name]

# Доступ к shell контейнера
docker compose -f docker-compose.dev.yml exec backend sh
docker compose -f docker-compose.dev.yml exec frontend sh

# Пересборка образов
docker compose -f docker-compose.dev.yml build --no-cache
```

## 🛡️ Безопасность

- `.env.dev` содержит dev-креденшалы и **НЕ должен** коммититься в Git
- Production переменные хранятся в `.env.prod` (будет создан позже)
- PostgreSQL закрыт внутри Docker-сети, доступ только для backend-контейнера

## 📝 Следующие Шаги

1. Инициализация NestJS приложения в `backend/`
2. Инициализация React приложения в `frontend/`
3. Создание `schema.prisma` и первых миграций
4. Разработка API endpoints
5. Создание UI компонентов

## 📄 Лицензия

MIT
