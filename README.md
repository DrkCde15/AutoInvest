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

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Infrastructure

```bash
podman compose -f infrastructure/containers/compose.yml up -d
```

## Safety and constraints

- No real brokerage or bank integrations are enabled.
- All trading orders are simulated only.
- All services are designed to be extended safely without introducing production-grade real-money execution paths.

## Dependency note

During installation on Python 3.14, the `pyarrow` wheel was not reliably available in this environment. To stay compatible with the requested runtime, the project keeps the data-engineering scaffolding in place without forcing a failing `pyarrow` install during the initial MVP setup. This allows the architecture to remain ready for Parquet workflows without destabilizing the local environment.
