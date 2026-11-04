from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Portfolio, Position, User
from app.modules.market_data.service import get_latest_prices
from app.modules.portfolio.schemas import Holding, PortfolioResponse

MONEY_QUANTUM = Decimal("0.01")
PERCENT_QUANTUM = Decimal("0.01")


class PortfolioNotFoundError(Exception):
    """Raised when the demo portfolio has not been seeded yet."""


def get_demo_portfolio(db: Session) -> Portfolio:
    portfolio = db.scalar(
        select(Portfolio).join(User).where(User.email == settings.demo_user_email)
    )
    if portfolio is None:
        raise PortfolioNotFoundError(
            "Demo portfolio not found. Run `python -m app.database.seed` before using the API."
        )
    return portfolio


def get_portfolio(db: Session, portfolio: Portfolio) -> PortfolioResponse:
    positions = db.scalars(
        select(Position)
        .where(Position.portfolio_id == portfolio.id)
        .order_by(Position.asset_symbol)
    ).all()

    quotes = get_latest_prices(db, [position.asset_symbol for position in positions])

    market_total = Decimal("0")
    cost_total = Decimal("0")
    rows: list[tuple[Position, Decimal, Decimal]] = []

    for position in positions:
        quote = quotes.get(position.asset_symbol)
        current_price = quote.price if quote else position.average_price
        market_value = (current_price * position.quantity).quantize(
            MONEY_QUANTUM, rounding=ROUND_HALF_UP
        )
        market_total += market_value
        cost_total += position.average_price * position.quantity
        rows.append((position, current_price, market_value))

    total_value = (portfolio.cash_balance + market_total).quantize(
        MONEY_QUANTUM, rounding=ROUND_HALF_UP
    )

    total_return_pct = Decimal("0")
    if cost_total > 0:
        total_return_pct = ((market_total - cost_total) / cost_total * 100).quantize(
            PERCENT_QUANTUM, rounding=ROUND_HALF_UP
        )

    holdings = [
        Holding(
            symbol=position.asset_symbol,
            quantity=position.quantity,
            average_price=position.average_price,
            current_price=current_price,
            market_value=market_value,
            allocation_pct=(
                (market_value / total_value * 100).quantize(
                    PERCENT_QUANTUM, rounding=ROUND_HALF_UP
                )
                if total_value > 0
                else Decimal("0")
            ),
        )
        for position, current_price, market_value in rows
    ]
    holdings.sort(key=lambda holding: holding.market_value, reverse=True)

    return PortfolioResponse(
        total_value=total_value,
        total_return_pct=total_return_pct,
        cash_balance=portfolio.cash_balance,
        holdings=holdings,
    )
