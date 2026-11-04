from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.models import MarketPrice


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
