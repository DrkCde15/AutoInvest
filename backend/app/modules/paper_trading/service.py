from __future__ import annotations

from app.modules.paper_trading.schemas import SimulatedOrderRequest, SimulatedOrderResponse

_paper_trading_enabled = True


class PaperTradingDisabledError(Exception):
    """Raised when an order is submitted while paper trading is paused."""


def is_paper_trading_enabled() -> bool:
    return _paper_trading_enabled


def set_paper_trading_enabled(enabled: bool) -> bool:
    global _paper_trading_enabled
    _paper_trading_enabled = enabled
    return _paper_trading_enabled


def execute_order(order: SimulatedOrderRequest) -> SimulatedOrderResponse:
    if not is_paper_trading_enabled():
        raise PaperTradingDisabledError("Paper trading is paused. Enable it before placing simulated orders.")

    if not order.symbol or not order.side:
        raise ValueError("symbol and side are required")

    if order.side.lower() not in {"buy", "sell"}:
        raise ValueError("side must be 'buy' or 'sell'")

    if order.quantity <= 0:
        raise ValueError("quantity must be greater than zero")

    return SimulatedOrderResponse(
        order_id=f"paper-{order.symbol.lower()}-{abs(hash(order.symbol + order.side)) % 10000}",
        symbol=order.symbol.upper(),
        side=order.side.lower(),
        quantity=order.quantity,
        status="simulated",
        message="Order accepted in paper-trading mode. No assets or cash were moved.",
        simulated_executed=True,
    )
