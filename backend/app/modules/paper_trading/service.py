from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Asset, Portfolio, Position
from app.database.models import Order as OrderModel
from app.modules.market_data.service import get_latest_price
from app.modules.paper_trading.schemas import SimulatedOrderRequest, SimulatedOrderResponse

MONEY_QUANTUM = Decimal("0.01")
PRICE_QUANTUM = Decimal("0.000001")


class PaperTradingDisabledError(Exception):
    """Raised when an order is submitted while paper trading is paused."""


def is_paper_trading_enabled(portfolio: Portfolio) -> bool:
    return portfolio.paper_trading_enabled


def set_paper_trading_enabled(db: Session, portfolio: Portfolio, enabled: bool) -> bool:
    portfolio.paper_trading_enabled = enabled
    db.commit()
    db.refresh(portfolio)
    return portfolio.paper_trading_enabled


def execute_order(
    db: Session, portfolio: Portfolio, request: SimulatedOrderRequest
) -> SimulatedOrderResponse:
    if not portfolio.paper_trading_enabled:
        raise PaperTradingDisabledError(
            "Paper trading is paused. Enable it before placing simulated orders."
        )

    locked_portfolio = db.get(Portfolio, portfolio.id, with_for_update=True)
    if locked_portfolio is None:
        raise ValueError("Portfolio not found")

    symbol = request.symbol.upper()
    asset = db.get(Asset, symbol)
    if asset is None:
        raise ValueError(f"Unknown asset: {symbol}")

    quote = get_latest_price(db, symbol)
    if quote is None:
        raise ValueError(f"No market price available for {symbol}")

    quantity = Decimal(request.quantity)
    price = quote.price
    notional = (price * quantity).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)

    position = db.scalar(
        select(Position)
        .where(
            Position.portfolio_id == locked_portfolio.id,
            Position.asset_symbol == symbol,
        )
        .with_for_update()
    )

    if request.side == "buy":
        if locked_portfolio.cash_balance < notional:
            raise ValueError("Insufficient cash balance for this order")
        locked_portfolio.cash_balance = (
            locked_portfolio.cash_balance - notional
        ).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)

        if position is None:
            position = Position(
                portfolio_id=locked_portfolio.id,
                asset_symbol=symbol,
                quantity=quantity,
                average_price=price,
            )
            db.add(position)
        else:
            new_quantity = position.quantity + quantity
            position.average_price = (
                (position.average_price * position.quantity) + notional
            ) / new_quantity
            position.average_price = position.average_price.quantize(
                PRICE_QUANTUM, rounding=ROUND_HALF_UP
            )
            position.quantity = new_quantity
    else:
        if position is None or position.quantity < quantity:
            raise ValueError("Insufficient position quantity for this sell order")
        locked_portfolio.cash_balance = (
            locked_portfolio.cash_balance + notional
        ).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)

        remaining = position.quantity - quantity
        if remaining <= 0:
            db.delete(position)
        else:
            position.quantity = remaining

    order = OrderModel(
        portfolio_id=locked_portfolio.id,
        asset_symbol=symbol,
        side=request.side,
        quantity=quantity,
        executed_price=price,
        notional=notional,
        order_type=request.order_type,
        strategy_name=request.strategy_name,
        status="simulated",
        simulated_executed=True,
    )
    db.add(order)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return SimulatedOrderResponse(
        order_id=str(order.id),
        symbol=symbol,
        side=request.side,
        quantity=quantity,
        price=price,
        notional=notional,
        status=order.status,
        message="Order accepted in paper-trading mode. No assets or cash were moved.",
        simulated_executed=True,
    )
