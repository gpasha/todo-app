#!/bin/bash

# 🛠️ Development Helper Script для TODO Service
# Упрощает работу с Docker командами

set -e

COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.dev"

# Подключаем .env.dev как env-file, если он существует
# (файл в .gitignore, поэтому у нового окружения его может не быть)
COMPOSE_ENV_ARGS=""
if [ -f "${ENV_FILE}" ]; then
  COMPOSE_ENV_ARGS="--env-file ${ENV_FILE}"
else
  echo -e "\033[1;33m⚠️  ${ENV_FILE} не найден, используются дефолты из ${COMPOSE_FILE}\033[0m" >&2
  echo -e "\033[1;33m   Создайте его: cp .env.example .env.dev\033[0m" >&2
fi

DC="docker compose -f ${COMPOSE_FILE} ${COMPOSE_ENV_ARGS}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_help() {
  echo -e "${GREEN}TODO Service - Development Helper${NC}"
  echo ""
  echo "Usage: ./dev.sh [command]"
  echo ""
  echo "Commands:"
  echo "  up          - Start all services (with build)"
  echo "  down        - Stop and remove containers"
  echo "  restart     - Restart all services"
  echo "  logs        - Show logs (all services)"
  echo "  logs-be     - Show backend logs"
  echo "  logs-fe     - Show frontend logs"
  echo "  logs-db     - Show database logs"
  echo "  ps          - Show running containers"
  echo "  shell-be    - Open backend shell"
  echo "  shell-fe    - Open frontend shell"
  echo "  shell-db    - Open database shell (psql)"
  echo "  migrate     - Run Prisma migration"
  echo "  studio      - Open Prisma Studio (GUI for DB)"
  echo "  db-reset    - Reset database (⚠️  deletes all data)"
  echo "  install-be  - Install backend package"
  echo "  install-fe  - Install frontend package"
  echo "  rebuild     - Rebuild all containers (no cache)"
  echo "  clean       - Stop and remove everything (including volumes)"
  echo "  help        - Show this help"
}

case "$1" in
  up)
    echo -e "${GREEN}🚀 Starting services...${NC}"
    $DC up -d --build
    echo -e "${GREEN}✅ Services started!${NC}"
    echo ""
    echo "Frontend: http://localhost:5173"
    echo "Backend:  http://localhost:3000"
    ;;
    
  down)
    echo -e "${YELLOW}⏹️  Stopping services...${NC}"
    $DC down
    echo -e "${GREEN}✅ Services stopped${NC}"
    ;;
    
  restart)
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    $DC restart
    echo -e "${GREEN}✅ Services restarted${NC}"
    ;;
    
  logs)
    $DC logs -f
    ;;
    
  logs-be)
    $DC logs -f backend
    ;;
    
  logs-fe)
    $DC logs -f frontend
    ;;
    
  logs-db)
    $DC logs -f postgres
    ;;
    
  ps)
    $DC ps
    ;;
    
  shell-be)
    echo -e "${GREEN}🐚 Opening backend shell...${NC}"
    $DC exec backend sh
    ;;
    
  shell-fe)
    echo -e "${GREEN}🐚 Opening frontend shell...${NC}"
    $DC exec frontend sh
    ;;
    
  shell-db)
    echo -e "${GREEN}🐚 Opening database shell...${NC}"
    $DC exec postgres psql -U todouser -d tododb
    ;;
    
  migrate)
    if [ -z "$2" ]; then
      echo -e "${RED}❌ Migration name required${NC}"
      echo "Usage: ./dev.sh migrate <migration_name>"
      exit 1
    fi
    echo -e "${GREEN}🗄️  Creating migration: $2${NC}"
    $DC exec backend npx prisma migrate dev --name "$2"
    echo -e "${GREEN}✅ Migration created${NC}"
    ;;
    
  studio)
    echo -e "${GREEN}🎨 Opening Prisma Studio...${NC}"
    echo "Opening at http://localhost:5555"
    $DC exec backend npx prisma studio
    ;;
    
  db-reset)
    echo -e "${RED}⚠️  WARNING: This will delete ALL data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo -e "${YELLOW}🗄️  Resetting database...${NC}"
      $DC exec backend npx prisma migrate reset --force
      echo -e "${GREEN}✅ Database reset complete${NC}"
    else
      echo -e "${YELLOW}Cancelled${NC}"
    fi
    ;;
    
  install-be)
    if [ -z "$2" ]; then
      echo -e "${RED}❌ Package name required${NC}"
      echo "Usage: ./dev.sh install-be <package-name>"
      exit 1
    fi
    echo -e "${GREEN}📦 Installing backend package: $2${NC}"
    $DC exec backend npm install "$2"
    echo -e "${GREEN}✅ Package installed${NC}"
    echo -e "${YELLOW}Restarting backend...${NC}"
    $DC restart backend
    ;;
    
  install-fe)
    if [ -z "$2" ]; then
      echo -e "${RED}❌ Package name required${NC}"
      echo "Usage: ./dev.sh install-fe <package-name>"
      exit 1
    fi
    echo -e "${GREEN}📦 Installing frontend package: $2${NC}"
    $DC exec frontend npm install "$2"
    echo -e "${GREEN}✅ Package installed${NC}"
    echo -e "${YELLOW}Restarting frontend...${NC}"
    $DC restart frontend
    ;;
    
  rebuild)
    echo -e "${YELLOW}🔨 Rebuilding containers (no cache)...${NC}"
    $DC build --no-cache
    echo -e "${GREEN}✅ Rebuild complete${NC}"
    ;;
    
  clean)
    echo -e "${RED}⚠️  WARNING: This will remove all containers and volumes!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo -e "${YELLOW}🧹 Cleaning up...${NC}"
      $DC down -v
      echo -e "${GREEN}✅ Cleanup complete${NC}"
    else
      echo -e "${YELLOW}Cancelled${NC}"
    fi
    ;;
    
  help|"")
    print_help
    ;;
    
  *)
    echo -e "${RED}❌ Unknown command: $1${NC}"
    echo ""
    print_help
    exit 1
    ;;
esac
