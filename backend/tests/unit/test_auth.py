from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.config import DEFAULT_DEV_JWT_SECRET, Settings, settings


def _login(client, email: str, password: str):
    return client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )


def test_demo_login_returns_jwt(client):
    response = _login(client, settings.demo_user_email, settings.demo_user_password)
    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["expires_in"] > 0
    assert payload["access_token"].count(".") == 2


def test_login_rejects_invalid_password(client):
    response = _login(client, settings.demo_user_email, "wrong-password")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_invalid_token_is_rejected(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401


def test_protected_endpoints_require_authentication(client):
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/portfolio").status_code == 401
    assert client.get("/api/v1/paper-trading/status").status_code == 401
    assert client.post(
        "/api/v1/paper-trading/orders",
        json={"symbol": "PETR4", "side": "buy", "quantity": 1},
    ).status_code == 401


def test_me_returns_authenticated_user(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == settings.demo_user_email
    assert payload["full_name"] == "Demo Investor"
    assert payload["is_active"] is True


def test_register_creates_user_and_isolated_portfolio(client, auth_headers):
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "New.User@Example.com",
            "password": "strong-password",
            "full_name": "New User",
        },
    )
    assert register.status_code == 201
    new_user = register.json()
    assert new_user["email"] == "new.user@example.com"
    assert new_user["full_name"] == "New User"

    login = _login(client, "new.user@example.com", "strong-password")
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["id"] == new_user["id"]

    portfolio = client.get("/api/v1/portfolio", headers=headers)
    assert portfolio.status_code == 200
    payload = portfolio.json()
    assert Decimal(str(payload["cash_balance"])) == settings.initial_cash_balance
    assert payload["holdings"] == []

    demo_portfolio = client.get("/api/v1/portfolio", headers=auth_headers).json()
    assert Decimal(str(demo_portfolio["total_value"])) == Decimal("24292.90")


def test_register_rejects_duplicate_email(client):
    payload = {
        "email": "duplicate@autoinvest.dev",
        "password": "strong-password",
        "full_name": "Duplicate User",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201

    response = client.post(
        "/api/v1/auth/register",
        json={**payload, "email": payload["email"].upper()},
    )
    assert response.status_code == 409


def test_register_validates_password_length(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "short@example.com",
            "password": "short",
            "full_name": "Short Password",
        },
    )
    assert response.status_code == 422


def test_production_requires_custom_jwt_secret():
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            jwt_secret_key=DEFAULT_DEV_JWT_SECRET,
        )

    configured = Settings(
        environment="production",
        jwt_secret_key="custom-production-secret-with-32-bytes",
    )
    assert configured.jwt_secret_key == "custom-production-secret-with-32-bytes"
