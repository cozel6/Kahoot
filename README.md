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

| Area | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic |
| Frontend | React 18, TypeScript, Vite |
| Database | PostgreSQL 16 |
| Real-time | WebSocket (FastAPI native) |
| Containerization | Docker, Docker Compose |

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
- PostgreSQL: localhost:5432

To stop the stack:

```bash
docker compose -f docker/docker-compose.yml down
```

To stop and remove the database volume (fresh start):

```bash
docker compose -f docker/docker-compose.yml down -v
```

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
