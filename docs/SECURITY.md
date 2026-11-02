# Security posture

The MVP is intentionally limited and safe by default.

## Supported rules

- All trading is simulated.
- No access to bank accounts or credentials is permitted.
- No brokerage APIs are enabled in the default stack.
- HTTP middleware is limited to CORS for local UI orchestration.

## Future controls

- JWT or OAuth2 for user identity.
- Role-based access control.
- Secret management via environment variables.
- Rate limits and audit logging.
