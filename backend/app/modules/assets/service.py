from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Asset as AssetModel
from app.modules.assets.schemas import Asset
from app.modules.market_data.service import PriceQuote, get_latest_prices


def _to_schema(asset: AssetModel, quote: PriceQuote | None) -> Asset:
    return Asset(
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        market=asset.market,
        currency=asset.currency,
        price=quote.price if quote else Decimal("0"),
        change_pct=quote.change_pct if quote else Decimal("0"),
    )


def list_assets(db: Session) -> list[Asset]:
    assets = db.scalars(select(AssetModel).order_by(AssetModel.symbol)).all()
    quotes = get_latest_prices(db, [asset.symbol for asset in assets])
    return [_to_schema(asset, quotes.get(asset.symbol)) for asset in assets]


def get_asset(db: Session, symbol: str) -> Asset | None:
    asset = db.get(AssetModel, symbol.upper())
    if asset is None:
        return None
    quote = get_latest_prices(db, [asset.symbol]).get(asset.symbol)
    return _to_schema(asset, quote)
