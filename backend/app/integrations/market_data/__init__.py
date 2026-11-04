from app.core.config import Settings
from app.integrations.market_data.base import (
    MarketDataProvider,
    MarketDataProviderError,
    MarketInstrument,
    ProviderQuote,
)
from app.integrations.market_data.brapi import BrapiMarketDataProvider
from app.integrations.market_data.mock import MockMarketDataProvider

__all__ = [
    "BrapiMarketDataProvider",
    "MarketDataProvider",
    "MarketDataProviderError",
    "MarketInstrument",
    "MockMarketDataProvider",
    "ProviderQuote",
    "build_provider",
]


def build_provider(settings: Settings) -> MarketDataProvider:
    if settings.market_data_provider == "brapi":
        return BrapiMarketDataProvider(
            token=settings.brapi_token,
            base_url=settings.brapi_base_url,
        )
    return MockMarketDataProvider()
