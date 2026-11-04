from decimal import Decimal

from sqlalchemy import select

from app.database.models import Order


def _decimal(value) -> Decimal:
    return Decimal(str(value))


def test_status_can_be_paused_and_persists(client, auth_headers):
    paused = client.patch(
        "/api/v1/paper-trading/status",
        headers=auth_headers,
        json={"enabled": False},
    )
    assert paused.status_code == 200
    assert paused.json()["enabled"] is False

    status = client.get("/api/v1/paper-trading/status", headers=auth_headers)
    assert status.status_code == 200
    assert status.json()["enabled"] is False

    active = client.patch(
        "/api/v1/paper-trading/status",
        headers=auth_headers,
        json={"enabled": True},
    )
    assert active.status_code == 200
    assert active.json()["enabled"] is True


def test_paused_paper_trading_rejects_orders(client, auth_headers):
    client.patch(
        "/api/v1/paper-trading/status",
        headers=auth_headers,
        json={"enabled": False},
    )

    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "buy", "quantity": 1},
    )
    assert response.status_code == 409
    assert "paused" in response.json()["detail"]


def test_buy_order_updates_cash_and_position(client, db_session, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "petr4", "side": "buy", "quantity": 1},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["symbol"] == "PETR4"
    assert payload["simulated_executed"] is True
    assert _decimal(payload["price"]) == Decimal("36.45")
    assert _decimal(payload["notional"]) == Decimal("36.45")

    portfolio = client.get("/api/v1/portfolio", headers=auth_headers).json()
    assert _decimal(portfolio["cash_balance"]) == Decimal("14963.55")
    petr4 = next(holding for holding in portfolio["holdings"] if holding["symbol"] == "PETR4")
    assert _decimal(petr4["quantity"]) == Decimal("81")

    orders = db_session.scalars(select(Order)).all()
    assert len(orders) == 1
    assert str(orders[0].id) == payload["order_id"]


def test_sell_order_updates_cash_and_position(client, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "sell", "quantity": 10},
    )
    assert response.status_code == 200

    portfolio = client.get("/api/v1/portfolio", headers=auth_headers).json()
    assert _decimal(portfolio["cash_balance"]) == Decimal("15364.50")
    petr4 = next(holding for holding in portfolio["holdings"] if holding["symbol"] == "PETR4")
    assert _decimal(petr4["quantity"]) == Decimal("70")


def test_order_history_returns_orders_for_current_portfolio(client, auth_headers):
    order = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "buy", "quantity": 2},
    )
    assert order.status_code == 200

    response = client.get("/api/v1/paper-trading/orders", headers=auth_headers)

    assert response.status_code == 200
    history = response.json()
    assert len(history) == 1
    assert history[0]["order_id"] == order.json()["order_id"]
    assert history[0]["symbol"] == "PETR4"
    assert history[0]["side"] == "buy"
    assert history[0]["simulated_executed"] is True
    assert history[0]["created_at"]


def test_order_history_is_scoped_to_authenticated_portfolio(client, auth_headers):
    first_order = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "buy", "quantity": 1},
    )
    assert first_order.status_code == 200

    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "order-history@example.com",
            "password": "strong-password",
            "full_name": "Order History",
        },
    )
    assert register.status_code == 201
    login = client.post(
        "/api/v1/auth/login",
        data={
            "username": "order-history@example.com",
            "password": "strong-password",
        },
    )
    assert login.status_code == 200
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    response = client.get("/api/v1/paper-trading/orders", headers=other_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_unknown_asset_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "UNKNOWN", "side": "buy", "quantity": 1},
    )
    assert response.status_code == 400
    assert "Unknown asset" in response.json()["detail"]


def test_insufficient_cash_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "buy", "quantity": 1000},
    )
    assert response.status_code == 400
    assert "Insufficient cash" in response.json()["detail"]


def test_insufficient_position_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "sell", "quantity": 500},
    )
    assert response.status_code == 400
    assert "Insufficient position" in response.json()["detail"]


def test_invalid_payload_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/paper-trading/orders",
        headers=auth_headers,
        json={"symbol": "PETR4", "side": "hold", "quantity": 1},
    )
    assert response.status_code == 422
