from app.modules.portfolio.schemas import Holding, PortfolioResponse

_HOLDINGS = [
    {
        "symbol": "PETR4",
        "quantity": 80.0,
        "average_price": 31.2,
        "current_price": 36.45,
        "market_value": 2916.0,
        "allocation_pct": 31.2,
    },
    {
        "symbol": "HGLG11",
        "quantity": 22.0,
        "average_price": 91.5,
        "current_price": 98.2,
        "market_value": 2160.4,
        "allocation_pct": 23.1,
    },
    {
        "symbol": "IVVB11",
        "quantity": 15.0,
        "average_price": 260.0,
        "current_price": 281.1,
        "market_value": 4216.5,
        "allocation_pct": 45.1,
    },
]


def get_portfolio() -> PortfolioResponse:
    holdings = [Holding(**row) for row in _HOLDINGS]
    total_value = sum(h.market_value for h in holdings)
    return PortfolioResponse(
        total_value=total_value + 15000.0,
        total_return_pct=12.84,
        cash_balance=15000.0,
        holdings=holdings,
    )
