from app.shared.schemas.common import BaseSchema


class Asset(BaseSchema):
    symbol: str
    name: str
    asset_type: str
    price: float
    change_pct: float
    market: str
    currency: str = "BRL"
