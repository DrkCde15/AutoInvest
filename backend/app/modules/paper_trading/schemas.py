from app.shared.schemas.common import BaseSchema


class SimulatedOrderRequest(BaseSchema):
    symbol: str
    side: str
    quantity: int
    order_type: str = "market"
    strategy_name: str = "mean_reversion"


class SimulatedOrderResponse(BaseSchema):
    order_id: str
    symbol: str
    side: str
    quantity: int
    status: str
    message: str
    simulated_executed: bool


class PaperTradingStatusResponse(BaseSchema):
    enabled: bool
    mode: str = "paper"
    message: str


class PaperTradingToggleRequest(BaseSchema):
    enabled: bool
