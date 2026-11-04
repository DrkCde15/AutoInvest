from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import InvalidTokenError, decode_access_token
from app.database.models import User
from app.database.session import get_db_session

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_prefix}/auth/login",
    auto_error=False,
)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db_session),
) -> User:
    if not token:
        raise _credentials_exception()

    try:
        payload = decode_access_token(token)
        user_id = UUID(payload["sub"])
    except (InvalidTokenError, ValueError):
        raise _credentials_exception() from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _credentials_exception()
    return user
