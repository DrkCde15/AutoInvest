from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database.models import Asset, MarketPrice, Portfolio, Position, User

ASSET_SEED = [
    {
        "symbol": "PETR4",
        "name": "Petróleo Brasileiro SA",
        "asset_type": "stock",
        "market": "B3",
        "price": Decimal("36.45"),
        "change_pct": Decimal("1.84"),
    },
    {
        "symbol": "HGLG11",
        "name": "CSHG Logística FII",
        "asset_type": "fii",
        "market": "B3",
        "price": Decimal("98.20"),
        "change_pct": Decimal("0.34"),
    },
    {
        "symbol": "IVVB11",
        "name": "iShares S&P 500 ETF",
        "asset_type": "etf",
        "market": "B3",
        "price": Decimal("281.10"),
        "change_pct": Decimal("0.92"),
    },
    {
        "symbol": "BTCBRL",
        "name": "Bitcoin BRL",
        "asset_type": "crypto",
        "market": "Crypto",
        "price": Decimal("482500.00"),
        "change_pct": Decimal("2.68"),
    },
    {
        "symbol": "NTN-B",
        "name": "Tesouro IPCA+",
        "asset_type": "fixed_income",
        "market": "Tesouro",
        "price": Decimal("1980.00"),
        "change_pct": Decimal("0.24"),
    },
]

DEMO_POSITIONS = [
    {"symbol": "PETR4", "quantity": Decimal("80"), "average_price": Decimal("31.20")},
    {"symbol": "HGLG11", "quantity": Decimal("22"), "average_price": Decimal("91.50")},
    {"symbol": "IVVB11", "quantity": Decimal("15"), "average_price": Decimal("260.00")},
]

DEMO_CASH_BALANCE = Decimal("15000.00")


def seed(db: Session) -> None:
    now = datetime.now(UTC)
    for item in ASSET_SEED:
        asset = db.get(Asset, item["symbol"])
        if asset is None:
            asset = Asset(
                symbol=item["symbol"],
                name=item["name"],
                asset_type=item["asset_type"],
                market=item["market"],
            )
            db.add(asset)

        latest_price = db.scalar(
            select(MarketPrice)
            .where(MarketPrice.asset_symbol == item["symbol"])
            .order_by(MarketPrice.quoted_at.desc(), MarketPrice.id.desc())
            .limit(1)
        )
        if latest_price is None or latest_price.price != item["price"]:
            db.add(
                MarketPrice(
                    asset_symbol=item["symbol"],
                    price=item["price"],
                    change_pct=item["change_pct"],
                    quoted_at=now,
                )
            )

    user = db.scalar(select(User).where(User.email == settings.demo_user_email))
    if user is None:
        user = User(
            email=settings.demo_user_email,
            full_name="Demo Investor",
            hashed_password=hash_password(settings.demo_user_password),
        )
        db.add(user)
        db.flush()
    elif not user.hashed_password:
        user.hashed_password = hash_password(settings.demo_user_password)

    portfolio = db.scalar(select(Portfolio).where(Portfolio.user_id == user.id))
    if portfolio is None:
        portfolio = Portfolio(user_id=user.id, cash_balance=DEMO_CASH_BALANCE)
        db.add(portfolio)
        db.flush()

        for item in DEMO_POSITIONS:
            db.add(
                Position(
                    portfolio_id=portfolio.id,
                    asset_symbol=item["symbol"],
                    quantity=item["quantity"],
                    average_price=item["average_price"],
                )
            )

    db.commit()


def main() -> None:
    from app.database.session import SessionLocal

    with SessionLocal() as db:
        seed(db)
    print("Seed completed: demo portfolio is ready.")


if __name__ == "__main__":
    main()
