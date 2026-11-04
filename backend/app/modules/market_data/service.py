from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Asset, MarketPrice
from app.integrations.market_data.base import (
    MarketDataProvider,
    MarketInstrument,
    ProviderQuote,
)


@dataclass(frozen=True)
class PriceQuote:
    symbol: str
    price: Decimal
    change_pct: Decimal
    quoted_at: datetime


def get_latest_prices(db: Session, symbols: list[str]) -> dict[str, PriceQuote]:
    if not symbols:
        return {}

    ranked = (
        select(
            MarketPrice.asset_symbol,
            MarketPrice.price,
            MarketPrice.change_pct,
            MarketPrice.quoted_at,
            func.row_number()
            .over(
                partition_by=MarketPrice.asset_symbol,
                order_by=(MarketPrice.quoted_at.desc(), MarketPrice.id.desc()),
            )
            .label("row_number"),
        )
        .where(MarketPrice.asset_symbol.in_(symbols))
        .subquery()
    )

    rows = db.execute(select(ranked).where(ranked.c.row_number == 1)).all()
    return {
        row.asset_symbol: PriceQuote(
            symbol=row.asset_symbol,
            price=row.price,
            change_pct=row.change_pct,
            quoted_at=row.quoted_at,
        )
        for row in rows
    }


def get_latest_price(db: Session, symbol: str) -> PriceQuote | None:
    return get_latest_prices(db, [symbol]).get(symbol)


def get_price_history(db: Session, symbol: str, limit: int = 100) -> list[MarketPrice]:
    return list(
        db.scalars(
            select(MarketPrice)
            .where(MarketPrice.asset_symbol == symbol)
            .order_by(MarketPrice.quoted_at.desc(), MarketPrice.id.desc())
            .limit(limit)
        ).all()
    )


def record_quotes(
    db: Session,
    quotes: Sequence[ProviderQuote],
    *,
    quoted_at: datetime | None = None,
) -> int:
    timestamp = quoted_at or datetime.now(UTC)
    for quote in quotes:
        db.add(
            MarketPrice(
                asset_symbol=quote.symbol,
                price=quote.price,
                change_pct=quote.change_pct,
                quoted_at=timestamp,
            )
        )
    db.commit()
    return len(quotes)


def refresh_quotes(db: Session, provider: MarketDataProvider) -> int:
    assets = db.scalars(select(Asset).order_by(Asset.symbol)).all()
    instruments = [
        MarketInstrument(symbol=asset.symbol, market=asset.market) for asset in assets
    ]
    known_symbols = {instrument.symbol for instrument in instruments}
    quotes = [
        quote for quote in provider.fetch_quotes(instruments) if quote.symbol in known_symbols
    ]
    return record_quotes(db, quotes)


def prune_price_history(
    db: Session, *, reference: datetime | None = None
) -> int:
    cutoff = (reference or datetime.now(UTC)) - timedelta(
        days=settings.market_data_retention_days
    )
    result = db.execute(delete(MarketPrice).where(MarketPrice.quoted_at < cutoff))
    db.commit()
    return int(result.rowcount or 0)
