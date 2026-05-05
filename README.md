# Kahoot Clone

A real-time multiplayer quiz game built as a university project for the Computer Networks course. The application demonstrates client-server architecture, WebSocket-based real-time communication, and state synchronization between a central server and multiple concurrent clients.

## Features

- Host creates a game room and receives a short join code
- Players join using the code plus a nickname (no accounts, no passwords)
- Two question types: True/False and multiple choice with four options
- Real-time question delivery to all connected players
- Scoring based on correctness and response time
- Leaderboard between questions and at the end of the game
- Target capacity of 20 to 30 concurrent players per room

## Tech Stack

| Area             | Technology                                    |
| ---------------- | --------------------------------------------- |
| Backend          | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic |
| Frontend         | React 18, TypeScript, Vite                    |
| Database         | PostgreSQL 16                                 |
| Real-time        | WebSocket (FastAPI native)                    |
| Containerization | Docker, Docker Compose                        |

## Architecture

The backend follows a pragmatic Clean Architecture with three main layers plus pure domain entities:

- `api/` — HTTP routes and WebSocket handlers (presentation)
- `services/` — application use cases (start game, submit answer, compute scores)
- `db/` — SQLAlchemy models and repositories (infrastructure)
- `domain/` — pure entities (Quiz, Question, Player, GameSession)
- `schemas/` — Pydantic DTOs for requests, responses, and WebSocket messages
- `core/` — configuration and shared utilities

## Prerequisites

- Docker Desktop
- Git

That is all. Everything else (Python, Node, PostgreSQL) runs inside containers.

If you prefer to run the backend or frontend directly on your host for development, you will additionally need:

- Python 3.11 or newer
- Node.js 20 or newer

## Getting Started

Clone the repository and start the full stack with a single command:

```bash
git clone <repo-url>
cd Kahoot
docker compose -f docker/docker-compose.yml up --build
```

Once all containers are healthy:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs
- PostgreSQL: localhost:5433

To stop the stack:

```bash
docker compose -f docker/docker-compose.yml down
```

To stop and remove the database volume (fresh start):

```bash
docker compose -f docker/docker-compose.yml down -v
```

## Local Setup (without Docker)

This section describes how to install and run the project locally, without Docker.

### Required Software (versions)

| Software | Minimum version | Download |
|---|---|---|
| Python | 3.11 | https://www.python.org/downloads/ |
| Node.js | 20 | https://nodejs.org/ |
| PostgreSQL | 16 | https://www.postgresql.org/download/ |
| Git | any | https://git-scm.com/ |

### 1. Clone the repository

```bash
git clone <repo-url>
cd Kahoot
```

### 2. Configure the database

Create a local PostgreSQL database:

```sql
CREATE USER kahoot WITH PASSWORD 'kahoot';
CREATE DATABASE kahoot OWNER kahoot;
```

### 3. Install and start the backend

```bash
cd backend

# Create a Python virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install -e ".[dev]"

# Configure environment variables
cp .env.example .env
# Edit .env and set:
#   DATABASE_URL=postgresql+asyncpg://kahoot:kahoot@localhost:5432/kahoot
#   CORS_ORIGINS=http://localhost:5173

# Apply database migrations
alembic upgrade head

# Start the server (flags: --host and --port)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server runs at `http://localhost:8000`. API documentation (Swagger) is available at `http://localhost:8000/docs`.

`uvicorn` flags:
- `--host 0.0.0.0` — the server accepts connections on all network interfaces (required for LAN access)
- `--port 8000` — the port the server listens on (change if 8000 is already in use)
- `--reload` — automatically reloads on code changes (development only)

### 4. Install and start the frontend

Open a new terminal:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set:
#   VITE_API_URL=http://localhost:8000
#   VITE_WS_URL=ws://localhost:8000

# Start the development server
npm run dev -- --host 0.0.0.0
```

The frontend runs at `http://localhost:5173`.

The `--host 0.0.0.0` flag allows access from other machines on the same local network (LAN). Players on other devices connect to `http://<your-IP>:5173`.

### 5. Multi-machine setup (on LAN)

1. Find the IP address of the machine running the server: `ipconfig` (Windows) or `ifconfig` / `ip a` (macOS/Linux)
2. On other machines, open `http://<IP>:5173` in a browser
3. Update the frontend `.env` with the real IP: `VITE_API_URL=http://<IP>:8000`

### Software versions used in this project

| Component | Version |
|---|---|
| Python | 3.11+ |
| FastAPI | 0.110+ |
| SQLAlchemy | 2.0+ |
| Alembic | 1.13+ |
| Pydantic | 2.5+ |
| Uvicorn | 0.27+ |
| React | 18.2 |
| TypeScript | 5.2 |
| Vite | 5.1 |
| Zustand | 4.5 |
| Node.js | 20+ |
| PostgreSQL | 16 |

## Project Structure

```
Kahoot/
├── backend/     FastAPI application
├── frontend/    React + TypeScript client
├── docker/      Dockerfiles and docker-compose.yml
└── README.md
```

## License

This is an academic project. Not intended for production use.
