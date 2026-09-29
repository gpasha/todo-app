# 🛠️ Development Guide

## Быстрый Старт

### 1. Первоначальная Сборка и Запуск
```bash
# В корне проекта
docker compose -f docker-compose.dev.yml up --build
```

Это запустит:
- **PostgreSQL** на порту `5432`
- **Backend (NestJS)** на порту `3000`
- **Frontend (React)** на порту `5173`

### 2. Доступ к Приложению
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Backend Health Check: http://localhost:3000/health

### 3. Проверка Статуса Контейнеров
```bash
docker compose -f docker-compose.dev.yml ps
```

---

## 🔄 Работа с Кодом (Hot Reload)

### Автоматическая Перезагрузка
Все изменения в коде автоматически отслеживаются:

**Backend (NestJS):**
- Изменения в `backend/src/**/*.ts` → автоматический перезапуск
- Watch mode: `nest start --watch`

**Frontend (Vite):**
- Изменения в `frontend/src/**/*` → мгновенный HMR
- Обновление без перезагрузки страницы

### Просмотр Логов
```bash
# Все сервисы
docker compose -f docker-compose.dev.yml logs -f

# Только backend
docker compose -f docker-compose.dev.yml logs -f backend

# Только frontend
docker compose -f docker-compose.dev.yml logs -f frontend

# Только database
docker compose -f docker-compose.dev.yml logs -f postgres
```

---

## 📦 Управление Зависимостями

### ⚠️ ВАЖНО: Не устанавливайте пакеты локально!

Все зависимости управляются **внутри контейнеров**.

### Установка Новых Пакетов

**Backend:**
```bash
# Установка пакета
docker compose -f docker-compose.dev.yml exec backend npm install <package-name>

# Установка dev-зависимости
docker compose -f docker-compose.dev.yml exec backend npm install -D <package-name>

# Перезапуск после установки
docker compose -f docker-compose.dev.yml restart backend
```

**Frontend:**
```bash
# Установка пакета
docker compose -f docker-compose.dev.yml exec frontend npm install <package-name>

# Dev-зависимость
docker compose -f docker-compose.dev.yml exec frontend npm install -D <package-name>

# Перезапуск
docker compose -f docker-compose.dev.yml restart frontend
```

### Удаление Пакетов
```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend npm uninstall <package-name>

# Frontend
docker compose -f docker-compose.dev.yml exec frontend npm uninstall <package-name>
```

---

## 🗄️ Работа с Базой Данных

### Prisma Миграции

**Создание новой миграции:**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name <migration_name>
```

**Применение существующих миграций:**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
```

**Генерация Prisma Client:**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma generate
```

**Сброс БД (⚠️ удаляет все данные):**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate reset
```

**Prisma Studio (GUI для БД):**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```
Откроется на: http://localhost:5555

### Прямой Доступ к PostgreSQL

**Через psql:**
```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U todouser -d tododb
```

**SQL команды:**
```sql
-- Список таблиц
\dt

-- Структура таблицы
\d todos

-- Все записи
SELECT * FROM todos;

-- Выход
\q
```

**Бэкап БД:**
```bash
docker compose -f docker-compose.dev.yml exec postgres pg_dump -U todouser tododb > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Восстановление из бэкапа:**
```bash
docker compose -f docker-compose.dev.yml exec -T postgres psql -U todouser tododb < backup.sql
```

---

## 🐳 Docker Команды

### Перезапуск Сервисов
```bash
# Все сервисы
docker compose -f docker-compose.dev.yml restart

# Один сервис
docker compose -f docker-compose.dev.yml restart backend
```

### Остановка без Удаления
```bash
docker compose -f docker-compose.dev.yml stop
```

### Запуск Остановленных Контейнеров
```bash
docker compose -f docker-compose.dev.yml start
```

### Полная Остановка и Удаление
```bash
# Без удаления данных БД
docker compose -f docker-compose.dev.yml down

# С удалением volumes (⚠️ потеря данных БД)
docker compose -f docker-compose.dev.yml down -v
```

### Пересборка Образов
```bash
# Пересборка с нуля (без кэша)
docker compose -f docker-compose.dev.yml build --no-cache

# Пересборка и запуск
docker compose -f docker-compose.dev.yml up --build
```

### Доступ к Shell Контейнера
```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend sh

# Frontend
docker compose -f docker-compose.dev.yml exec frontend sh

# PostgreSQL
docker compose -f docker-compose.dev.yml exec postgres sh
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker image prune

# Удалить все остановленные контейнеры
docker container prune

# Полная очистка (осторожно!)
docker system prune -a --volumes
```

---

## 🧪 Тестирование

### Backend Tests
```bash
# Unit тесты
docker compose -f docker-compose.dev.yml exec backend npm test

# E2E тесты
docker compose -f docker-compose.dev.yml exec backend npm run test:e2e

# Coverage
docker compose -f docker-compose.dev.yml exec backend npm run test:cov
```

### Frontend Tests
```bash
# Тесты (когда настроим)
docker compose -f docker-compose.dev.yml exec frontend npm test
```

---

## 🔍 Отладка

### Проверка Здоровья Сервисов

**Backend Health Check:**
```bash
curl http://localhost:3000/health
```

**Database Connection:**
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma db push --skip-generate
```

### Типичные Проблемы

**1. Контейнер не запускается**
```bash
# Смотрим логи
docker compose -f docker-compose.dev.yml logs backend

# Проверяем статус
docker compose -f docker-compose.dev.yml ps
```

**2. Hot Reload не работает**
- Проверьте, что volumes корректно примонтированы
- Перезапустите контейнер: `docker compose -f docker-compose.dev.yml restart backend`

**3. Ошибки Prisma**
```bash
# Пересоздание Prisma Client
docker compose -f docker-compose.dev.yml exec backend npx prisma generate

# Проверка статуса миграций
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate status
```

**4. Порт уже занят**
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>
```

**5. Проблемы с зависимостями**
```bash
# Пересборка без кэша
docker compose -f docker-compose.dev.yml build --no-cache backend

# Очистка node_modules и переустановка
docker compose -f docker-compose.dev.yml exec backend rm -rf node_modules package-lock.json
docker compose -f docker-compose.dev.yml restart backend
```

---

## 📊 Мониторинг Ресурсов

### Использование Памяти/CPU
```bash
docker stats
```

### Размер Контейнеров
```bash
docker ps -s
```

### Очистка Места
```bash
# Посмотреть занимаемое место
docker system df

# Очистить
docker system prune
```

---

## 🚀 Workflow для Новых Фич

1. **Создать ветку:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Убедиться что контейнеры запущены:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **Внести изменения в код** (Hot Reload автоматически применит их)

4. **Создать миграцию (если меняли схему БД):**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name add_new_field
   ```

5. **Протестировать:**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend npm test
   ```

6. **Закоммитить:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

---

## 📚 Полезные Ресурсы

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
