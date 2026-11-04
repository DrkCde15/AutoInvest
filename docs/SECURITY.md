# Security posture

The MVP is intentionally limited and safe by default.

## Supported rules

- All trading is simulated.
- No access to bank accounts or credentials is permitted.
- No brokerage APIs are enabled in the default stack.
- Passwords are hashed with Argon2 (`pwdlib`) and never stored in plain text.
- API authentication uses signed JWT access tokens (HS256 by default) with an expiration.
- Portfolio and paper-trading endpoints are scoped to the authenticated user.
- CORS is restricted to the configured frontend origins.

## Configuration

- `JWT_SECRET_KEY` must be replaced outside development. The application refuses to start in non-development environments while the default development secret is in use.
- `DEMO_USER_PASSWORD` changes the seeded demo credential. Demo data is for local development only.
- `ACCESS_TOKEN_EXPIRE_MINUTES` controls token lifetime.

## Known tradeoffs

- The frontend stores the access token in `localStorage` to keep the SPA simple. A production hardening step should move session handling to short-lived tokens with refresh rotation or secure `HttpOnly` cookies.
- There is no login rate limiting or account lockout yet.
- Tokens cannot be revoked before expiration; logout only removes the client-side token.

## Future controls

- Refresh tokens and revocation.
- Role-based access control.
- Login rate limits and audit logging.
- Secret management through a dedicated provider.
