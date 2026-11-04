from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies.portfolio import get_current_portfolio
from app.database.models import Portfolio
from app.database.session import get_db_session
from app.modules.paper_trading.schemas import (
    PaperOrderHistoryItem,
    PaperTradingStatusResponse,
    PaperTradingToggleRequest,
    SimulatedOrderRequest,
    SimulatedOrderResponse,
)
from app.modules.paper_trading.service import (
    PaperTradingDisabledError,
    execute_order,
    is_paper_trading_enabled,
    list_orders,
    set_paper_trading_enabled,
)

router = APIRouter(prefix="/paper-trading", tags=["paper-trading"])


def _status_message(enabled: bool) -> str:
    if enabled:
        return "Paper trading is enabled. No real financial operations are executed."
    return "Paper trading is paused. No simulated orders can be placed."


@router.get("/status", response_model=PaperTradingStatusResponse)
def paper_trading_status(
    portfolio: Portfolio = Depends(get_current_portfolio),
) -> PaperTradingStatusResponse:
    enabled = is_paper_trading_enabled(portfolio)
    return PaperTradingStatusResponse(enabled=enabled, message=_status_message(enabled))


@router.patch("/status", response_model=PaperTradingStatusResponse)
def update_paper_trading_status(
    request: PaperTradingToggleRequest,
    db: Session = Depends(get_db_session),
    portfolio: Portfolio = Depends(get_current_portfolio),
) -> PaperTradingStatusResponse:
    enabled = set_paper_trading_enabled(db, portfolio, request.enabled)
    return PaperTradingStatusResponse(enabled=enabled, message=_status_message(enabled))


@router.get("/orders", response_model=list[PaperOrderHistoryItem])
def get_order_history(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db_session),
    portfolio: Portfolio = Depends(get_current_portfolio),
) -> list[PaperOrderHistoryItem]:
    return list_orders(db, portfolio, limit=limit)


@router.post("/orders", response_model=SimulatedOrderResponse)
def create_order(
    order: SimulatedOrderRequest,
    db: Session = Depends(get_db_session),
    portfolio: Portfolio = Depends(get_current_portfolio),
) -> SimulatedOrderResponse:
    try:
        return execute_order(db, portfolio, order)
    except PaperTradingDisabledError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
