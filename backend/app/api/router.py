from fastapi import APIRouter

from app.api.routes import assets, auth, health, paper_trading, portfolio

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(assets.router)
api_router.include_router(portfolio.router)
api_router.include_router(paper_trading.router)
