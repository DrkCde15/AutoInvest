# Architecture

AutoInvest follows a modular monolith architecture designed for future orchestration and domain growth.

## Layers

- `backend/app/api`: HTTP endpoints and transport contracts.
- `backend/app/core`: cross-cutting configuration, logging, and security concerns.
- `backend/app/database`: SQLAlchemy models, session factory, seed, and Alembic migrations.
- `backend/app/modules`: domain modules for auth, users, portfolio, assets, strategy, and trading.
- `backend/app/integrations`: future third-party adapters for market data and broker APIs.
- `frontend/src`: Next.js client application.
- `data-engineering`: ETL-ready data pipelines.

## Domain modules

The MVP includes the following module boundaries:

- `auth`: JWT authentication, registration, and password hashing.
- `users`: profile and risk preference metadata.
- `assets`: market assets and instrument metadata.
- `portfolio`: allocation and performance summaries.
- `trading`: execution strategy orchestration.
- `paper_trading`: simulated order workflow without real-money flow.
- `risk`: portfolio risk and scenario analysis.
- `audit`: system event history and compliance traces.

## Design principles

- Keep execution flow deterministic for local development.
- Avoid real-money pathways by architecture and contract design.
- Prefer simple domain services over framework-heavy implementations.
- Prepare modules for later data ingestion and AI integration.
