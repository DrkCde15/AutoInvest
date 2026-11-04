from datetime import datetime
from decimal import Decimal

from app.shared.schemas.common import BaseSchema


class Asset(BaseSchema):
    symbol: str
    name: str
    asset_type: str
    price: Decimal
    change_pct: Decimal
    market: str
    currency: str = "BRL"


class PricePoint(BaseSchema):
    price: Decimal
    change_pct: Decimal
    quoted_at: datetime
