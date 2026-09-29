# 🗄️ Prisma Database Schema

## Модели Данных

### Todo Model
Основная сущность для хранения задач.

**Поля:**
- `id` (String, UUID) - Уникальный идентификатор
- `title` (String, max 255) - Название задачи
- `description` (String, nullable) - Детальное описание
- `completed` (Boolean, default: false) - Статус выполнения
- `priority` (Priority enum: LOW/MEDIUM/HIGH) - Приоритет задачи
- `dueDate` (DateTime, nullable) - Дедлайн выполнения
- `createdAt` (DateTime) - Дата создания (автоматически)
- `updatedAt` (DateTime) - Дата обновления (автоматически)

**Индексы:**
- `completed` - для быстрой фильтрации по статусу
- `createdAt` - для сортировки по дате создания
- `priority` - для фильтрации по приоритету

## Команды Миграций (внутри контейнера)

### Создание новой миграции:
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name <migration_name>
```

### Применение миграций (production):
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
```

### Генерация Prisma Client:
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma generate
```

### Сброс базы данных (⚠️ удаляет все данные):
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate reset
```

### Prisma Studio (GUI для БД):
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```
Откроется на http://localhost:5555

### Просмотр состояния миграций:
```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate status
```

## Подключение к PostgreSQL напрямую:

```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U todouser -d tododb
```

### Полезные SQL команды:
```sql
-- Посмотреть все таблицы
\dt

-- Описание таблицы todos
\d todos

-- Количество записей
SELECT COUNT(*) FROM todos;

-- Все задачи
SELECT * FROM todos;
```
