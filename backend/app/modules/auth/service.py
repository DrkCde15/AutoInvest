from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.database.models import Portfolio, User


class UserAlreadyExistsError(Exception):
    """Raised when a registration uses an email that is already taken."""


_DUMMY_PASSWORD_HASH = hash_password("autoinvest-dummy-password")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def register_user(
    db: Session, *, email: str, password: str, full_name: str
) -> User:
    normalized_email = normalize_email(email)
    existing = db.scalar(select(User).where(func.lower(User.email) == normalized_email))
    if existing is not None:
        raise UserAlreadyExistsError("An account with this email already exists")

    user = User(
        email=normalized_email,
        full_name=full_name.strip(),
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.flush()
    db.add(Portfolio(user_id=user.id, cash_balance=settings.initial_cash_balance))
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> User | None:
    normalized_email = normalize_email(email)
    user = db.scalar(select(User).where(func.lower(User.email) == normalized_email))
    if user is None or not user.is_active:
        verify_password(password, _DUMMY_PASSWORD_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
