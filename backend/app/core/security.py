from __future__ import annotations

from typing import Any


def create_demo_token(user_id: str) -> str:
    """Generate a deterministic demo token for local development.

    The MVP deliberately avoids real authentication and is intentionally
    simulation-only. The token is used only to exercise the API contract.
    """
    return f"demo-token:{user_id}:autoinvest"


def get_user_context(token: str | None) -> dict[str, Any]:
    if not token:
        return {"user_id": "anonymous", "authenticated": False}
    return {"user_id": token.split(":", 2)[1], "authenticated": True}
