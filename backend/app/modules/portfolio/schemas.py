from app.shared.schemas.common import BaseSchema


class Holding(BaseSchema):
    symbol: str
    quantity: float
    average_price: float
    current_price: float
    market_value: float
    allocation_pct: float


class PortfolioResponse(BaseSchema):
    total_value: float
    total_return_pct: float
    cash_balance: float
    holdings: list[Holding]
