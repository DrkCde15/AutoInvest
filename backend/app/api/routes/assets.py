from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db_session
from app.modules.assets.schemas import Asset, PricePoint
from app.modules.assets.service import get_asset, list_assets
from app.modules.market_data.service import get_price_history

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[Asset])
def get_assets(db: Session = Depends(get_db_session)) -> list[Asset]:
    return list_assets(db)


@router.get("/{symbol}", response_model=Asset)
def get_single_asset(symbol: str, db: Session = Depends(get_db_session)) -> Asset:
    asset = get_asset(db, symbol)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset {symbol.upper()} not found")
    return asset


@router.get("/{symbol}/prices", response_model=list[PricePoint])
def get_asset_prices(
    symbol: str,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_session),
) -> list[PricePoint]:
    normalized_symbol = symbol.upper()
    if get_asset(db, normalized_symbol) is None:
        raise HTTPException(status_code=404, detail=f"Asset {normalized_symbol} not found")
    return get_price_history(db, normalized_symbol, limit)
