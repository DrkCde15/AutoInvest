# Database Design

The system is designed for PostgreSQL in production, with a SQLite fallback for local tests and quick development.

## Current setup

- Local default: `sqlite:///./autoinvest.db`
- Production candidate: PostgreSQL via `postgresql+psycopg://...`

## Core tables expected for future implementation

- `users`
- `portfolios`
- `assets`
- `market_prices`
- `orders`
- `strategy_runs`
- `paper_trades`
- `audit_events`

## Migration strategy

- Use SQLAlchemy models for domain entities.
- Use Alembic for schema evolution.
- Keep the data layer isolated behind repository/service boundaries.
