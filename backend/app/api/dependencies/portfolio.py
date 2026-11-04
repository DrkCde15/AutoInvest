from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.database.models import Portfolio, User
from app.database.session import get_db_session


def get_current_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> Portfolio:
    portfolio = db.scalar(select(Portfolio).where(Portfolio.user_id == current_user.id))
    if portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No portfolio found for the authenticated user",
        )
    return portfolio
