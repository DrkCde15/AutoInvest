# Database Design

The backend persists its domain data with SQLAlchemy 2.0 and evolves the schema with Alembic. SQLite is the default for local development and tests; PostgreSQL is the production target.

## Current tables

| Table | Purpose | Key constraints |
|---|---|---|
| `users` | Application users | unique email, Argon2 password hash |
| `portfolios` | One portfolio per user, cash balance, paper-trading flag | unique `user_id`, FK to `users` |
| `assets` | Tradable instruments | primary key `symbol` |
| `market_prices` | Price history per asset, populated by the market data worker | FK to `assets`, indexed by symbol and timestamp |
| `positions` | Current holdings per portfolio | unique (`portfolio_id`, `asset_symbol`) |
| `orders` | Simulated order log | FK to portfolio and asset, check on `side` |

Monetary values use `Numeric`, never floating point. Quantities use `Numeric(20, 8)` to support fractional crypto positions.

## Migrations

Alembic reads the database URL from application settings (`DATABASE_URL`).

```bash
cd backend
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "describe change"
uv run alembic check
```

The Compose stack runs migrations and the idempotent seed automatically before the backend starts.

## Seed

`app/database/seed.py` is idempotent. It creates the asset universe, the initial market prices, and the demo user/portfolio/positions used by the MVP endpoints.

```bash
cd backend
uv run python -m app.database.seed
```

## Connection settings

- Local default: `sqlite:///./autoinvest.db`
- Production: `postgresql+psycopg://user:password@host:5432/database`

Sessions are created per request through `get_db_session` and closed afterward.
