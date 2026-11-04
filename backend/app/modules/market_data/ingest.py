from __future__ import annotations

from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging import logger
from app.database.session import SessionLocal
from app.integrations.market_data import MarketDataProviderError, build_provider
from app.modules.market_data.service import prune_price_history, refresh_quotes


def main() -> int:
    provider = build_provider(settings)
    try:
        with SessionLocal() as db:
            count = refresh_quotes(db, provider)
            pruned = prune_price_history(db)
    except (MarketDataProviderError, SQLAlchemyError):
        logger.exception("Market data ingestion failed")
        return 1
    finally:
        close = getattr(provider, "close", None)
        if callable(close):
            close()

    logger.info("Recorded %s market quotes using %s (pruned %s)", count, provider.name, pruned)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
