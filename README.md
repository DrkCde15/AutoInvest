# AutoInvest

AutoInvest is an MVP platform for investment tracking, market analysis, portfolio management, strategy testing, and paper trading. The monorepo is organized into a Python FastAPI backend, a Next.js frontend, infrastructure definitions, and data-engineering scaffolding.

## Goals

- Provide a modular monolith for future expansion.
- Keep real trading disabled by design.
- Simulate market and portfolio operations safely in paper-trading mode.
- Prepare the foundation for future integrations with brokers, exchanges, ETL, and AI services.

## Repository structure

- `backend/`: FastAPI application, tests, and container definition.
- `frontend/`: Next.js dashboard that consumes the API for quotes, portfolio, and simulated orders.
- `data-engineering/`: ETL and dataset folders for future analytics workloads.
- `infrastructure/`: Compose and environment configuration for PostgreSQL, Redis, and local services.
- `docs/`: Architecture and operational documentation.

## Frontend pages

- `/` — public landing page with links to account access and registration.
- `/login` — sign in with an existing account.
- `/cadastro` — create an account and continue to the dashboard.
- `/dashboard` — market overview, portfolio summary, and order ticket.
- `/portfolio` — authenticated portfolio balance and holdings.
- `/assets` — available instruments and stored quote history.
- `/orders` — simulated order ticket and authenticated order history.
- `/settings` — account information and paper-trading safety.
- `/strategies` and `/backtesting` — roadmap pages; these workflows are not implemented by the MVP backend yet.

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

### Database

Apply migrations and load the demo portfolio (SQLite by default):

```bash
cd backend
uv run alembic upgrade head
uv run python -m app.database.seed
```

The API reads assets, prices, positions, and orders from the database. If the demo portfolio has not been seeded, the demo account cannot sign in.

### Authentication

Protected endpoints require a JWT. The seed creates a development-only demo account, configurable through `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` (defaults: `demo@autoinvest.local` / `demo1234`).

Use `/login` to sign in or `/cadastro` to create an account. Successful authentication redirects to `/dashboard`.

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@autoinvest.local&password=demo1234"
```

Send the returned token as `Authorization: Bearer <access_token>`. Create additional accounts with `POST /api/v1/auth/register` (JSON with `email`, `password`, and `full_name`); each account gets its own isolated portfolio.

Set `JWT_SECRET_KEY` to a long random value outside development. The API refuses to start in non-development environments while the default development secret is in use.

### Market data

Quotes are loaded into `market_prices` by a provider layer. `MARKET_DATA_PROVIDER=mock` (default) simulates local price movements; `brapi` fetches B3 quotes from brapi.dev and can use `BRAPI_TOKEN`.

Run one ingestion cycle manually:

```bash
cd backend
uv run python -m app.modules.market_data.ingest
```

The Compose stack also runs a `market-data` worker that refreshes quotes every `MARKET_DATA_REFRESH_SECONDS` (default 300) and prunes history older than `MARKET_DATA_RETENTION_DAYS` (default 30). Price history is available at `GET /api/v1/assets/{symbol}/prices?limit=100`.

### Frontend

The dashboard reads market quotes, price history, the authenticated portfolio, and paper-trading state directly from the API. Set `NEXT_PUBLIC_API_URL` when the API is not available at `http://localhost:8000`.

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

The stack exposes the API on `http://localhost:8000` and the frontend on `http://localhost:3000`. Postgres credentials can be overridden with `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. Authentication settings can be overridden with `JWT_SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`, and `INITIAL_CASH_BALANCE`. Market data settings can be overridden with `MARKET_DATA_PROVIDER`, `MARKET_DATA_REFRESH_SECONDS`, `MARKET_DATA_RETENTION_DAYS`, `BRAPI_TOKEN`, and `BRAPI_BASE_URL`.

## Safety and constraints

- No real brokerage or bank integrations are enabled.
- All trading orders are simulated only.
- All services are designed to be extended safely without introducing production-grade real-money execution paths.

## Dependency note

During installation on Python 3.14, the `pyarrow` wheel was not reliably available in this environment. To stay compatible with the requested runtime, the project keeps the data-engineering scaffolding in place without forcing a failing `pyarrow` install during the initial MVP setup. This allows the architecture to remain ready for Parquet workflows without destabilizing the local environment.
