from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    Uuid,
    func,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

MONEY = Numeric(18, 2)
QUANTITY = Numeric(20, 8)
UNIT_PRICE = Numeric(20, 6)


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )

    portfolio: Mapped[Portfolio | None] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    name: Mapped[str] = mapped_column(String(80), default="Main", server_default="Main")
    base_currency: Mapped[str] = mapped_column(String(3), default="BRL", server_default="BRL")
    cash_balance: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"), server_default="0")
    paper_trading_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )

    user: Mapped[User] = relationship(back_populates="portfolio")
    positions: Mapped[list[Position]] = relationship(
        back_populates="portfolio", cascade="all, delete-orphan"
    )
    orders: Mapped[list[Order]] = relationship(
        back_populates="portfolio", cascade="all, delete-orphan"
    )


class Asset(Base):
    __tablename__ = "assets"

    symbol: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    asset_type: Mapped[str] = mapped_column(String(30))
    market: Mapped[str] = mapped_column(String(30))
    currency: Mapped[str] = mapped_column(String(3), default="BRL", server_default="BRL")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )

    prices: Mapped[list[MarketPrice]] = relationship(
        back_populates="asset", cascade="all, delete-orphan"
    )


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    asset_symbol: Mapped[str] = mapped_column(
        ForeignKey("assets.symbol", ondelete="CASCADE"), index=True
    )
    price: Mapped[Decimal] = mapped_column(UNIT_PRICE)
    change_pct: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), default=Decimal("0"), server_default="0"
    )
    quoted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), index=True
    )

    asset: Mapped[Asset] = relationship(back_populates="prices")


class Position(Base):
    __tablename__ = "positions"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "asset_symbol", name="portfolio_asset"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("portfolios.id", ondelete="CASCADE"), index=True
    )
    asset_symbol: Mapped[str] = mapped_column(ForeignKey("assets.symbol", ondelete="RESTRICT"))
    quantity: Mapped[Decimal] = mapped_column(QUANTITY)
    average_price: Mapped[Decimal] = mapped_column(UNIT_PRICE)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, server_default=func.now()
    )

    portfolio: Mapped[Portfolio] = relationship(back_populates="positions")
    asset: Mapped[Asset] = relationship()


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (CheckConstraint("side IN ('buy', 'sell')", name="side_valid"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("portfolios.id", ondelete="CASCADE"), index=True
    )
    asset_symbol: Mapped[str] = mapped_column(ForeignKey("assets.symbol", ondelete="RESTRICT"))
    side: Mapped[str] = mapped_column(String(4))
    quantity: Mapped[Decimal] = mapped_column(QUANTITY)
    executed_price: Mapped[Decimal] = mapped_column(UNIT_PRICE)
    notional: Mapped[Decimal] = mapped_column(MONEY)
    order_type: Mapped[str] = mapped_column(String(20), default="market", server_default="market")
    strategy_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="simulated", server_default="simulated"
    )
    simulated_executed: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), index=True
    )

    portfolio: Mapped[Portfolio] = relationship(back_populates="orders")
    asset: Mapped[Asset] = relationship()
