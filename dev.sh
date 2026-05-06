#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[1/3] Starting database (Docker)...${NC}"
docker compose -f "$ROOT/docker/docker-compose.yml" up -d

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
until docker compose -f "$ROOT/docker/docker-compose.yml" exec -T db pg_isready -U kahoot > /dev/null 2>&1; do
  sleep 1
done
echo -e "${GREEN}Database is ready.${NC}"

echo -e "${GREEN}[2/3] Starting backend...${NC}"
cd "$ROOT/backend"
source venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo -e "${GREEN}[3/3] Starting frontend...${NC}"
cd "$ROOT/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo -e "\n${GREEN}All services running:${NC}"
echo -e "  Backend:  http://localhost:8000"
echo -e "  API docs: http://localhost:8000/docs"
echo -e "  Frontend: http://localhost:5173"
echo -e "\n${YELLOW}Press Ctrl+C to stop everything.${NC}\n"

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  docker compose -f "$ROOT/docker/docker-compose.yml" stop
  echo -e "${RED}Stopped.${NC}"
}
trap cleanup EXIT INT TERM

wait $BACKEND_PID $FRONTEND_PID
