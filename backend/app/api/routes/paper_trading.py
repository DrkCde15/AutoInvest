from fastapi import APIRouter, HTTPException, status

from app.modules.paper_trading.schemas import (
    PaperTradingStatusResponse,
    PaperTradingToggleRequest,
    SimulatedOrderRequest,
    SimulatedOrderResponse,
)
from app.modules.paper_trading.service import (
    PaperTradingDisabledError,
    execute_order,
    is_paper_trading_enabled,
    set_paper_trading_enabled,
)

router = APIRouter(prefix="/paper-trading", tags=["paper-trading"])


@router.get("/status")
def paper_trading_status() -> PaperTradingStatusResponse:
    enabled = is_paper_trading_enabled()
    message = (
        "Paper trading is enabled. No real financial operations are executed."
        if enabled
        else "Paper trading is paused. No simulated orders can be placed."
    )
    return PaperTradingStatusResponse(enabled=enabled, message=message)


@router.patch("/status", response_model=PaperTradingStatusResponse)
def update_paper_trading_status(
    request: PaperTradingToggleRequest,
) -> PaperTradingStatusResponse:
    enabled = set_paper_trading_enabled(request.enabled)
    message = (
        "Paper trading is enabled. No real financial operations are executed."
        if enabled
        else "Paper trading is paused. No simulated orders can be placed."
    )
    return PaperTradingStatusResponse(enabled=enabled, message=message)


@router.post("/orders", response_model=SimulatedOrderResponse)
def create_order(order: SimulatedOrderRequest) -> SimulatedOrderResponse:
    try:
        return execute_order(order)
    except PaperTradingDisabledError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
