# 📊 Database Schema Documentation

## Overview
TODO Service использует PostgreSQL 16 с Prisma ORM для управления данными.

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│             Todo                    │
├─────────────────────────────────────┤
│ id          : UUID (PK)            │
│ title       : VARCHAR(255)         │
│ description : TEXT (nullable)      │
│ completed   : BOOLEAN (default: false) │
│ priority    : ENUM (LOW/MEDIUM/HIGH) │
│ dueDate     : TIMESTAMP (nullable) │
│ createdAt   : TIMESTAMP            │
│ updatedAt   : TIMESTAMP            │
└─────────────────────────────────────┘

Indexes:
- idx_todos_completed (completed)
- idx_todos_createdAt (createdAt)
- idx_todos_priority (priority)
```

## Data Types

### Priority Enum
```typescript
enum Priority {
  LOW    = "LOW"
  MEDIUM = "MEDIUM"
  HIGH   = "HIGH"
}
```

### Todo Interface (TypeScript)
```typescript
interface Todo {
  id: string                    // UUID v4
  title: string                 // Max 255 characters
  description: string | null    // Unlimited text
  completed: boolean            // Default: false
  priority: Priority            // Default: MEDIUM
  dueDate: Date | null         // Optional deadline
  createdAt: Date              // Auto-generated
  updatedAt: Date              // Auto-updated
}
```

## Database Queries Optimization

### Indexed Fields Benefits:
1. **completed** - Быстрая фильтрация активных/завершенных задач
2. **createdAt** - Эффективная сортировка по дате (новые/старые)
3. **priority** - Быстрый поиск задач по приоритету

### Example Queries:
```sql
-- Активные задачи с высоким приоритетом
SELECT * FROM todos 
WHERE completed = false AND priority = 'HIGH'
ORDER BY dueDate ASC NULLS LAST;

-- Последние 10 добавленных задач
SELECT * FROM todos 
ORDER BY createdAt DESC 
LIMIT 10;

-- Просроченные незавершенные задачи
SELECT * FROM todos 
WHERE completed = false 
  AND dueDate IS NOT NULL 
  AND dueDate < NOW();
```

## Migration Strategy

### Development:
- `prisma migrate dev` - создает миграцию и применяет ее
- Генерирует Prisma Client автоматически

### Production:
- `prisma migrate deploy` - только применение существующих миграций
- Без подтверждений, безопасно для CI/CD

### Reset (Development only):
- `prisma migrate reset` - дроп всех таблиц и повторное применение миграций
- Использовать для чистки dev-окружения

## Data Validation Rules

### Backend (NestJS):
- `title`: required, min 1 char, max 255 chars, trim
- `description`: optional, max 10000 chars
- `completed`: boolean, default false
- `priority`: must be one of: LOW, MEDIUM, HIGH
- `dueDate`: optional, must be future date (for new todos)

### Database Constraints:
- `id`: PRIMARY KEY, UUID
- `title`: NOT NULL, VARCHAR(255)
- `completed`: NOT NULL, DEFAULT false
- `priority`: NOT NULL, DEFAULT 'MEDIUM'
- All timestamps managed by Prisma

## Performance Considerations

### Connection Pooling:
Prisma использует встроенный connection pool:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=10"
```

### Query Optimization:
- Всегда используйте `select` для выборки только нужных полей
- Используйте `include` вместо отдельных запросов для связанных данных (будущие relations)
- Применяйте пагинацию для больших списков (`skip` и `take`)

### Recommended Prisma Settings:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  previewFeatures = ["fullTextSearch"] // для будущего поиска
}
```

## Backup & Recovery

### Backup (manual):
```bash
docker compose -f docker-compose.dev.yml exec postgres pg_dump -U todouser tododb > backup.sql
```

### Restore:
```bash
docker compose -f docker-compose.dev.yml exec -T postgres psql -U todouser tododb < backup.sql
```

## Security Notes

1. **Никогда не коммитить** реальные креденшалы в Git
2. Production DATABASE_URL должен использовать SSL
3. Принцип минимальных привилегий для DB user
4. Регулярные бэкапы production БД
