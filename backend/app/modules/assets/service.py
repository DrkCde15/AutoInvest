from __future__ import annotations

from app.modules.assets.schemas import Asset

_ASSET_DATA = [
    {
        "symbol": "PETR4",
        "name": "Petróleo Brasileiro SA",
        "asset_type": "stock",
        "price": 36.45,
        "change_pct": 1.84,
        "market": "B3",
    },
    {
        "symbol": "HGLG11",
        "name": "Hospital da Glória FII",
        "asset_type": "fii",
        "price": 98.2,
        "change_pct": 0.34,
        "market": "B3",
    },
    {
        "symbol": "IVVB11",
        "name": "iShares S&P 500 ETF",
        "asset_type": "etf",
        "price": 281.1,
        "change_pct": 0.92,
        "market": "B3",
    },
    {
        "symbol": "BTCBRL",
        "name": "Bitcoin BRL",
        "asset_type": "crypto",
        "price": 482500.0,
        "change_pct": 2.68,
        "market": "Crypto",
    },
    {
        "symbol": "NTN-B",
        "name": "Tesouro IPCA+",
        "asset_type": "fixed_income",
        "price": 1980.0,
        "change_pct": 0.24,
        "market": "Tesouro",
    },
]


def list_assets() -> list[Asset]:
    return [Asset(**row) for row in _ASSET_DATA]


def get_asset(symbol: str) -> Asset | None:
    for asset in list_assets():
        if asset.symbol.upper() == symbol.upper():
            return asset
    return None
