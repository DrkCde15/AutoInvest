from decimal import Decimal
from typing import Literal

from pydantic import Field

from app.shared.schemas.common import BaseSchema


class SimulatedOrderRequest(BaseSchema):
    symbol: str = Field(min_length=1, max_length=20)
    side: Literal["buy", "sell"]
    quantity: Decimal = Field(gt=0)
    order_type: Literal["market", "limit"] = "market"
    strategy_name: str = Field(default="mean_reversion", max_length=80)


class SimulatedOrderResponse(BaseSchema):
    order_id: str
    symbol: str
    side: str
    quantity: Decimal
    price: Decimal
    notional: Decimal
    status: str
    message: str
    simulated_executed: bool


class PaperTradingStatusResponse(BaseSchema):
    enabled: bool
    mode: str = "paper"
    message: str


class PaperTradingToggleRequest(BaseSchema):
    enabled: bool
