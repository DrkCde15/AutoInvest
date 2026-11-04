from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db_session
from app.modules.assets.schemas import Asset
from app.modules.assets.service import get_asset, list_assets

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
