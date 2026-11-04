from __future__ import annotations

import random
from collections.abc import Sequence
from decimal import ROUND_HALF_UP, Decimal

from app.integrations.market_data.base import (
    MarketInstrument,
    ProviderQuote,
)

BASE_PRICES: dict[str, Decimal] = {
    "PETR4": Decimal("36.45"),
    "HGLG11": Decimal("98.20"),
    "IVVB11": Decimal("281.10"),
    "BTCBRL": Decimal("482500.00"),
    "NTN-B": Decimal("1980.00"),
}

PRICE_QUANTUM = Decimal("0.000001")
CHANGE_QUANTUM = Decimal("0.0001")


class MockMarketDataProvider:
    name = "mock"

    def __init__(
        self,
        *,
        seed: int | None = None,
        base_prices: dict[str, Decimal] | None = None,
    ) -> None:
        self._random = random.Random(seed)
        self._prices = dict(base_prices or BASE_PRICES)

    def fetch_quotes(self, instruments: Sequence[MarketInstrument]) -> list[ProviderQuote]:
        quotes: list[ProviderQuote] = []
        for instrument in instruments:
            current = self._prices.get(instrument.symbol)
            if current is None:
                continue

            drift = Decimal(str(self._random.uniform(-0.015, 0.015)))
            price = (current * (1 + drift)).quantize(PRICE_QUANTUM, rounding=ROUND_HALF_UP)
            change_pct = (drift * 100).quantize(CHANGE_QUANTUM, rounding=ROUND_HALF_UP)
            self._prices[instrument.symbol] = price
            quotes.append(
                ProviderQuote(
                    symbol=instrument.symbol,
                    price=price,
                    change_pct=change_pct,
                )
            )
        return quotes
