import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.paper_trading.service import set_paper_trading_enabled


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_paper_trading_status():
    set_paper_trading_enabled(True)
    yield
    set_paper_trading_enabled(True)
