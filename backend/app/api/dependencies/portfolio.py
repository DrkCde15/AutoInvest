from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Portfolio
from app.database.session import get_db_session
from app.modules.portfolio.service import PortfolioNotFoundError, get_demo_portfolio


def get_current_portfolio(db: Session = Depends(get_db_session)) -> Portfolio:
    try:
        return get_demo_portfolio(db)
    except PortfolioNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
