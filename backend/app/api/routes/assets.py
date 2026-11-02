from fastapi import APIRouter, HTTPException

from app.modules.assets.schemas import Asset
from app.modules.assets.service import get_asset, list_assets

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[Asset])
def get_assets() -> list[Asset]:
    return list_assets()


@router.get("/{symbol}", response_model=Asset)
def get_single_asset(symbol: str) -> Asset:
    asset = get_asset(symbol)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset {symbol.upper()} not found")
    return asset
