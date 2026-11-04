from __future__ import annotations

import signal
from threading import Event

from app.core.config import settings
from app.core.logging import logger
from app.database.session import SessionLocal
from app.integrations.market_data import build_provider
from app.modules.market_data.service import prune_price_history, refresh_quotes


def main() -> None:
    provider = build_provider(settings)
    interval = max(settings.market_data_refresh_seconds, 5)
    stop_event = Event()

    def request_stop(signum, frame) -> None:
        logger.info("Market data worker received signal %s", signum)
        stop_event.set()

    signal.signal(signal.SIGTERM, request_stop)
    signal.signal(signal.SIGINT, request_stop)

    logger.info(
        "Market data worker started (provider=%s, interval=%ss)",
        provider.name,
        interval,
    )

    try:
        while not stop_event.is_set():
            try:
                with SessionLocal() as db:
                    count = refresh_quotes(db, provider)
                    pruned = prune_price_history(db)
                logger.info("Recorded %s market quotes (pruned %s old prices)", count, pruned)
            except Exception:
                logger.exception("Market data refresh failed")
            stop_event.wait(interval)
    finally:
        close = getattr(provider, "close", None)
        if callable(close):
            close()
        logger.info("Market data worker stopped")


if __name__ == "__main__":
    main()
