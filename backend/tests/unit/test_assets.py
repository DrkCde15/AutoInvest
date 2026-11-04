from decimal import Decimal


def test_assets_endpoint_returns_symbol_list(client):
    response = client.get("/api/v1/assets")
    assert response.status_code == 200
    assets = response.json()
    assert len(assets) >= 5
    assert {asset["symbol"] for asset in assets} >= {"PETR4", "HGLG11", "IVVB11"}


def test_asset_lookup(client):
    response = client.get("/api/v1/assets/PETR4")
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "Petróleo Brasileiro SA"
    assert payload["market"] == "B3"
    assert Decimal(str(payload["price"])) == Decimal("36.45")


def test_unknown_asset_returns_404(client):
    response = client.get("/api/v1/assets/UNKNOWN")
    assert response.status_code == 404
