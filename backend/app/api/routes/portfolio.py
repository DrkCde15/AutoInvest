from fastapi import APIRouter

from app.modules.portfolio.schemas import PortfolioResponse
from app.modules.portfolio.service import get_portfolio

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioResponse)
def portfolio_summary() -> PortfolioResponse:
    return get_portfolio()
