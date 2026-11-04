from __future__ import annotations

from collections.abc import Sequence
from decimal import ROUND_HALF_UP, Decimal

import httpx

from app.integrations.market_data.base import (
    MarketDataProviderError,
    MarketInstrument,
    ProviderQuote,
)

PRICE_QUANTUM = Decimal("0.000001")
CHANGE_QUANTUM = Decimal("0.0001")
SUPPORTED_MARKETS = {"B3"}


class BrapiMarketDataProvider:
    name = "brapi"

    def __init__(
        self,
        *,
        token: str | None = None,
        base_url: str = "https://brapi.dev/api",
        client: httpx.Client | None = None,
    ) -> None:
        self._token = token
        self._base_url = base_url.rstrip("/")
        self._client = client or httpx.Client(timeout=10)
        self._owns_client = client is None

    def fetch_quotes(self, instruments: Sequence[MarketInstrument]) -> list[ProviderQuote]:
        symbols = [item.symbol for item in instruments if item.market in SUPPORTED_MARKETS]
        if not symbols:
            return []

        params = {"token": self._token} if self._token else None
        try:
            response = self._client.get(
                f"{self._base_url}/quote/{','.join(symbols)}",
                params=params,
            )
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise MarketDataProviderError(f"brapi request failed: {exc}") from exc

        quotes: list[ProviderQuote] = []
        for result in payload.get("results") or []:
            symbol = result.get("symbol")
            price = result.get("regularMarketPrice")
            if not symbol or price is None:
                continue

            change_pct = result.get("regularMarketChangePercent") or 0
            quotes.append(
                ProviderQuote(
                    symbol=str(symbol).upper(),
                    price=Decimal(str(price)).quantize(PRICE_QUANTUM, rounding=ROUND_HALF_UP),
                    change_pct=Decimal(str(change_pct)).quantize(
                        CHANGE_QUANTUM, rounding=ROUND_HALF_UP
                    ),
                )
            )
        return quotes

    def close(self) -> None:
        if self._owns_client:
            self._client.close()
