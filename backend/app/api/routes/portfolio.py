from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.portfolio import get_current_portfolio
from app.database.models import Portfolio
from app.database.session import get_db_session
from app.modules.portfolio.schemas import PortfolioResponse
from app.modules.portfolio.service import get_portfolio

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioResponse)
def portfolio_summary(
    db: Session = Depends(get_db_session),
    portfolio: Portfolio = Depends(get_current_portfolio),
) -> PortfolioResponse:
    return get_portfolio(db, portfolio)
