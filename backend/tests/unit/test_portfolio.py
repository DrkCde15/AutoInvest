from decimal import Decimal


def test_portfolio_summary_is_computed_from_persisted_positions(client, auth_headers):
    response = client.get("/api/v1/portfolio", headers=auth_headers)
    assert response.status_code == 200
    payload = response.json()

    assert Decimal(str(payload["cash_balance"])) == Decimal("15000.00")
    assert Decimal(str(payload["total_value"])) == Decimal("24292.90")
    assert {holding["symbol"] for holding in payload["holdings"]} == {
        "PETR4",
        "HGLG11",
        "IVVB11",
    }

    petr4 = next(holding for holding in payload["holdings"] if holding["symbol"] == "PETR4")
    assert Decimal(str(petr4["quantity"])) == Decimal("80")
    assert Decimal(str(petr4["current_price"])) == Decimal("36.45")
    assert Decimal(str(petr4["market_value"])) == Decimal("2916.00")
