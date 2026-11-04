from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hasher = PasswordHash.recommended()


class InvalidTokenError(Exception):
    """Raised when an access token is missing, malformed, or expired."""


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str | None) -> bool:
    if not hashed_password:
        return False
    try:
        return password_hasher.verify(password, hashed_password)
    except Exception:
        return False


def create_access_token(
    subject: str, expires_delta: timedelta | None = None
) -> tuple[str, int]:
    lifetime = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": "access",
        "iat": now,
        "exp": now + lifetime,
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, int(lifetime.total_seconds())


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.InvalidTokenError as exc:
        raise InvalidTokenError("Could not validate credentials") from exc

    if payload.get("type") != "access" or not payload.get("sub"):
        raise InvalidTokenError("Could not validate credentials")
    return payload
