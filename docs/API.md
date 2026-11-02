# API Overview

The backend exposes a lightweight REST API with a versioned prefix: `/api/v1`.

## Core endpoints

- `GET /api/v1/health` — health check
- `POST /api/v1/auth/login` — simulated authentication token
- `GET /api/v1/assets` — asset universe
- `GET /api/v1/assets/{symbol}` — single asset lookup
- `GET /api/v1/portfolio` — portfolio summary
- `GET /api/v1/paper-trading/status` — paper trading mode state
- `PATCH /api/v1/paper-trading/status` — enable or pause paper trading with `{"enabled": true|false}`
- `POST /api/v1/paper-trading/orders` — simulated order placement

## Notes

The API intentionally does not allow real order execution or actual money movement. The order semantics are simulation-only and align with the paper-trading requirement. When paper trading is paused, new simulated orders return HTTP 409.
