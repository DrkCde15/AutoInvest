# AutoInvest

AutoInvest is an MVP platform for investment tracking, market analysis, portfolio management, strategy testing, and paper trading. The monorepo is organized into a Python FastAPI backend, a Next.js frontend, infrastructure definitions, and data-engineering scaffolding.

## Goals

- Provide a modular monolith for future expansion.
- Keep real trading disabled by design.
- Simulate market and portfolio operations safely in paper-trading mode.
- Prepare the foundation for future integrations with brokers, exchanges, ETL, and AI services.

## Repository structure

- `backend/`: FastAPI application, tests, and container definition.
- `frontend/`: Next.js dashboard and UI shell.
- `data-engineering/`: ETL and dataset folders for future analytics workloads.
- `infrastructure/`: Compose and environment configuration for PostgreSQL, Redis, and local services.
- `docs/`: Architecture and operational documentation.

## Local development

### Backend

The backend uses [uv](https://docs.astral.sh/uv/) for dependency management. The committed `backend/uv.lock` guarantees reproducible installs.

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tests and lint:

```bash
cd backend
uv run pytest
uv run ruff check .
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Lint, typecheck, and production build:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

### Infrastructure

```bash
podman compose -f infrastructure/containers/compose.yml up --build
```

The stack exposes the API on `http://localhost:8000` and the frontend on `http://localhost:3000`. Postgres credentials can be overridden with `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`.

## Safety and constraints

- No real brokerage or bank integrations are enabled.
- All trading orders are simulated only.
- All services are designed to be extended safely without introducing production-grade real-money execution paths.

## Dependency note

During installation on Python 3.14, the `pyarrow` wheel was not reliably available in this environment. To stay compatible with the requested runtime, the project keeps the data-engineering scaffolding in place without forcing a failing `pyarrow` install during the initial MVP setup. This allows the architecture to remain ready for Parquet workflows without destabilizing the local environment.
