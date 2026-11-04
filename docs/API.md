# API Overview

The backend exposes a lightweight REST API with a versioned prefix: `/api/v1`.

## Authentication

- `POST /api/v1/auth/register` — create an account with JSON `{"email": "...", "password": "...", "full_name": "..."}`; also creates the user portfolio
- `POST /api/v1/auth/login` — OAuth2 password flow (`application/x-www-form-urlencoded`, fields `username` = email and `password`); returns `access_token`, `token_type`, and `expires_in`
- `GET /api/v1/auth/me` — current authenticated user

Protected endpoints require `Authorization: Bearer <access_token>`. Missing, invalid, or expired tokens return HTTP 401 with `WWW-Authenticate: Bearer`.

The seed creates a development-only demo account using `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` (defaults: `demo@autoinvest.local` / `demo1234`).

## Core endpoints

- `GET /api/v1/health` — health check (public)
- `GET /api/v1/assets` — asset universe (public)
- `GET /api/v1/assets/{symbol}` — single asset lookup (public)
- `GET /api/v1/portfolio` — authenticated user portfolio summary
- `GET /api/v1/paper-trading/status` — paper trading mode state for the authenticated user
- `PATCH /api/v1/paper-trading/status` — enable or pause paper trading with `{"enabled": true|false}`
- `POST /api/v1/paper-trading/orders` — simulated order placement with `{"symbol": "...", "side": "buy|sell", "quantity": 1}`

## Notes

The API intentionally does not allow real order execution or actual money movement. The order semantics are simulation-only and align with the paper-trading requirement. When paper trading is paused, new simulated orders return HTTP 409.

Orders are persisted in the database, and buy/sell operations update the portfolio cash balance and positions atomically. Invalid symbols, insufficient cash, and insufficient positions return HTTP 400. Each user has an isolated portfolio; a newly registered account starts with the configured `INITIAL_CASH_BALANCE` and no positions.
