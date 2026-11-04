from datetime import UTC, datetime
from decimal import Decimal

import httpx
import pytest

from app.database.seed import seed
from app.integrations.market_data.base import (
    MarketDataProviderError,
    MarketInstrument,
    ProviderQuote,
)
from app.integrations.market_data.brapi import BrapiMarketDataProvider
from app.integrations.market_data.mock import BASE_PRICES, MockMarketDataProvider
from app.modules.market_data.service import (
    get_latest_price,
    prune_price_history,
    record_quotes,
    refresh_quotes,
)


class StaticProvider:
    name = "static"

    def __init__(self, quotes: list[ProviderQuote]) -> None:
        self._quotes = quotes

    def fetch_quotes(self, instruments) -> list[ProviderQuote]:
        return self._quotes


def _quote(symbol: str, price: str, change: str = "1.0000") -> ProviderQuote:
    return ProviderQuote(
        symbol=symbol,
        price=Decimal(price),
        change_pct=Decimal(change),
    )


def test_refresh_records_known_quotes_and_updates_assets(client, db_session):
    provider = StaticProvider(
        [
            _quote("PETR4", "40.000000", "9.7400"),
            _quote("UNKNOWN", "1.000000"),
        ]
    )

    assert refresh_quotes(db_session, provider) == 1

    asset = client.get("/api/v1/assets/PETR4").json()
    assert Decimal(asset["price"]) == Decimal("40.000000")
    assert Decimal(asset["change_pct"]) == Decimal("9.7400")


def test_price_history_returns_newest_first_and_respects_limit(client, db_session):
    record_quotes(
        db_session,
        [_quote("PETR4", "40.000000")],
        quoted_at=datetime(2030, 1, 1, tzinfo=UTC),
    )
    record_quotes(
        db_session,
        [_quote("PETR4", "41.000000")],
        quoted_at=datetime(2030, 1, 2, tzinfo=UTC),
    )

    response = client.get("/api/v1/assets/PETR4/prices?limit=2")
    assert response.status_code == 200
    prices = [Decimal(point["price"]) for point in response.json()]
    assert prices == [Decimal("41.000000"), Decimal("40.000000")]


def test_price_history_unknown_asset_returns_404(client):
    response = client.get("/api/v1/assets/UNKNOWN/prices")
    assert response.status_code == 404


def test_price_history_validates_limit(client):
    response = client.get("/api/v1/assets/PETR4/prices?limit=0")
    assert response.status_code == 422


def test_prune_price_history_removes_old_points(client, db_session):
    record_quotes(
        db_session,
        [_quote("PETR4", "1.000000")],
        quoted_at=datetime(2000, 1, 1, tzinfo=UTC),
    )

    assert prune_price_history(db_session) >= 1

    history = client.get("/api/v1/assets/PETR4/prices?limit=100").json()
    assert all(Decimal(point["price"]) != Decimal("1.000000") for point in history)


def test_seed_does_not_overwrite_existing_market_quotes(db_session):
    record_quotes(db_session, [_quote("PETR4", "40.000000")])

    seed(db_session)

    latest = get_latest_price(db_session, "PETR4")
    assert latest is not None
    assert latest.price == Decimal("40.000000")


def test_mock_provider_generates_moving_prices():
    provider = MockMarketDataProvider(seed=7, base_prices={"PETR4": BASE_PRICES["PETR4"]})
    instruments = [MarketInstrument(symbol="PETR4", market="B3")]

    first = provider.fetch_quotes(instruments)[0]
    second = provider.fetch_quotes(instruments)[0]

    assert first.price != BASE_PRICES["PETR4"]
    assert second.price != first.price
    assert first.change_pct != 0


def test_brapi_provider_parses_supported_markets():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/quote/PETR4,HGLG11"
        assert request.url.params.get("token") == "secret"
        return httpx.Response(
            200,
            json={
                "results": [
                    {
                        "symbol": "PETR4",
                        "regularMarketPrice": 36.45,
                        "regularMarketChangePercent": 1.84,
                    },
                    {
                        "symbol": "HGLG11",
                        "regularMarketPrice": 98.2,
                        "regularMarketChangePercent": -0.5,
                    },
                    {"symbol": "NO_PRICE", "regularMarketPrice": None},
                ]
            },
        )

    with httpx.Client(transport=httpx.MockTransport(handler)) as http_client:
        provider = BrapiMarketDataProvider(token="secret", client=http_client)
        quotes = provider.fetch_quotes(
            [
                MarketInstrument(symbol="PETR4", market="B3"),
                MarketInstrument(symbol="HGLG11", market="B3"),
                MarketInstrument(symbol="BTCBRL", market="Crypto"),
            ]
        )

    assert [quote.symbol for quote in quotes] == ["PETR4", "HGLG11"]
    assert quotes[0].price == Decimal("36.450000")
    assert quotes[0].change_pct == Decimal("1.8400")
    assert quotes[1].change_pct == Decimal("-0.5000")


def test_brapi_provider_raises_on_http_error():
    with httpx.Client(
        transport=httpx.MockTransport(lambda request: httpx.Response(503))
    ) as http_client:
        provider = BrapiMarketDataProvider(client=http_client)
        with pytest.raises(MarketDataProviderError):
            provider.fetch_quotes([MarketInstrument(symbol="PETR4", market="B3")])
