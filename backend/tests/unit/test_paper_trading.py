def test_status_can_be_paused_and_reenabled(client):
    paused = client.patch(
        "/api/v1/paper-trading/status",
        json={"enabled": False},
    )
    assert paused.status_code == 200
    assert paused.json()["enabled"] is False

    active = client.patch(
        "/api/v1/paper-trading/status",
        json={"enabled": True},
    )
    assert active.status_code == 200
    assert active.json()["enabled"] is True


def test_paused_paper_trading_rejects_orders(client):
    client.patch("/api/v1/paper-trading/status", json={"enabled": False})

    response = client.post(
        "/api/v1/paper-trading/orders",
        json={"symbol": "PETR4", "side": "buy", "quantity": 1},
    )
    assert response.status_code == 409
    assert "paused" in response.json()["detail"]


def test_active_paper_trading_accepts_simulated_orders(client):
    response = client.post(
        "/api/v1/paper-trading/orders",
        json={"symbol": "PETR4", "side": "buy", "quantity": 1},
    )
    assert response.status_code == 200
    assert response.json()["simulated_executed"] is True
