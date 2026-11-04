from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


class MarketDataProviderError(Exception):
    """Raised when a market data provider cannot deliver quotes."""


@dataclass(frozen=True)
class MarketInstrument:
    symbol: str
    market: str


@dataclass(frozen=True)
class ProviderQuote:
    symbol: str
    price: Decimal
    change_pct: Decimal


class MarketDataProvider(Protocol):
    name: str

    def fetch_quotes(self, instruments: Sequence[MarketInstrument]) -> list[ProviderQuote]: ...
