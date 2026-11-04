from decimal import Decimal

from app.shared.schemas.common import BaseSchema


class Holding(BaseSchema):
    symbol: str
    quantity: Decimal
    average_price: Decimal
    current_price: Decimal
    market_value: Decimal
    allocation_pct: Decimal


class PortfolioResponse(BaseSchema):
    total_value: Decimal
    total_return_pct: Decimal
    cash_balance: Decimal
    holdings: list[Holding]
