"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAssets,
  getPriceHistory,
  type Asset,
  type PricePoint,
} from "@/lib/api";
import {
  changeTone,
  formatCurrency,
  formatDateTime,
  formatPercent,
  toNumber,
} from "@/lib/format";

const REFRESH_INTERVAL_MS = 30_000;
const HISTORY_LIMIT = 60;

function PriceChart({
  points,
  symbol,
}: {
  points: PricePoint[];
  symbol: string;
}) {
  const values = useMemo(
    () => points.map((point) => toNumber(point.price)).reverse(),
    [points],
  );

  if (values.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#D7DFE8] text-sm text-[#68778A]">
        No price history yet. The market-data worker will populate it shortly.
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const padding = 14;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = maximum - minimum || Math.max(maximum * 0.01, 1);
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const coordinates = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : index * step;
    const y =
      height - padding - ((value - minimum) / span) * (height - padding * 2);
    return { x, y };
  });

  const latest = coordinates[coordinates.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-48 w-full"
      role="img"
      aria-label={`Price history for ${symbol}`}
    >
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={0}
          x2={width}
          y1={height * fraction}
          y2={height * fraction}
          stroke="#D7DFE8"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
      ))}
      <polyline
        points={coordinates
          .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
          .join(" ")}
        fill="none"
        stroke="#356A9A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={latest.x}
        cy={latest.y}
        r="4"
        fill="#356A9A"
        stroke="#FDFEFF"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function MarketOverview() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("PETR4");
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadAssets = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setIsRefreshing(true);
    }

    try {
      const data = await getAssets();
      setAssets(data);
      setAssetsError(null);
      setSelectedSymbol((current) =>
        data.some((asset) => asset.symbol === current)
          ? current
          : (data[0]?.symbol ?? ""),
      );
    } catch (error) {
      setAssetsError(
        error instanceof Error ? error.message : "Could not load market data.",
      );
    } finally {
      setIsLoadingAssets(false);
      if (showSpinner) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadAssets();
    }, 0);
    const interval = window.setInterval(() => {
      void loadAssets();
    }, REFRESH_INTERVAL_MS);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(interval);
    };
  }, [loadAssets]);

  useEffect(() => {
    if (!selectedSymbol) {
      return;
    }

    let isActive = true;

    async function loadHistory() {
      try {
        const data = await getPriceHistory(selectedSymbol, HISTORY_LIMIT);
        if (isActive) {
          setHistory(data);
          setHistoryError(null);
        }
      } catch (error) {
        if (isActive) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Could not load price history.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      }
    }

    const kickoff = window.setTimeout(() => {
      setHistoryError(null);
      setIsLoadingHistory(true);
      void loadHistory();
    }, 0);
    const interval = window.setInterval(() => {
      void loadHistory();
    }, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearTimeout(kickoff);
      window.clearInterval(interval);
    };
  }, [selectedSymbol]);

  const selectedAsset = assets.find(
    (asset) => asset.symbol === selectedSymbol,
  );
  const latestPoint = history[0];

  function selectAsset(symbol: string) {
    if (symbol === selectedSymbol) {
      return;
    }
    setHistory([]);
    setHistoryError(null);
    setSelectedSymbol(symbol);
  }

  return (
    <section className="rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1A2E45]">Market watch</h2>
          <p className="mt-1 text-sm text-[#526477]">
            Live quotes from the AutoInvest API. Updates every 30 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAssets(true)}
          disabled={isRefreshing}
          className="rounded-full border border-[#CDD6E1] px-3 py-1.5 text-xs font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#356A9A] disabled:cursor-wait disabled:opacity-60"
        >
          {isRefreshing ? "Refreshing..." : "Refresh quotes"}
        </button>
      </div>

      {assetsError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
        >
          {assetsError}
        </p>
      )}

      {isLoadingAssets && assets.length === 0 ? (
        <p className="mt-6 text-sm text-[#526477]">Loading market data...</p>
      ) : assets.length === 0 ? (
        <p className="mt-6 text-sm text-[#526477]">
          No assets are registered. Run the database seed to create the demo
          universe.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {assets.map((asset) => {
            const isSelected = asset.symbol === selectedSymbol;
            return (
              <button
                key={asset.symbol}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectAsset(asset.symbol)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#356A9A] bg-[#356A9A]/10"
                    : "border-[#D7DFE8] bg-[#F1F4F8]/50 hover:border-[#AEBBCC]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1A2E45]">
                    {asset.symbol}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#68778A]">
                    {asset.market}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[#526477]">
                  {asset.name}
                </p>
                <p className="mt-3 text-lg font-semibold text-[#1A2E45]">
                  {formatCurrency(asset.price, asset.currency)}
                </p>
                <p
                  className={`mt-1 text-xs font-medium ${changeTone(asset.change_pct)}`}
                >
                  {formatPercent(asset.change_pct)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#D7DFE8] bg-[#F1F4F8]/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#356A9A]">
              Price history
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#1A2E45]">
              {selectedSymbol || "Select an asset"}
              {selectedAsset ? (
                <span className="ml-2 text-sm font-normal text-[#526477]">
                  {selectedAsset.name}
                </span>
              ) : null}
            </h3>
          </div>
          {selectedAsset && (
            <div className="text-right">
              <p className="text-xl font-semibold text-[#1A2E45]">
                {formatCurrency(selectedAsset.price, selectedAsset.currency)}
              </p>
              <p
                className={`text-xs font-medium ${changeTone(selectedAsset.change_pct)}`}
              >
                {formatPercent(selectedAsset.change_pct)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          {isLoadingHistory && history.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-[#68778A]">
              Loading price history...
            </div>
          ) : (
            <PriceChart points={history} symbol={selectedSymbol} />
          )}
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#68778A]">
          <span>
            {history.length > 0
              ? `${history.length} stored quotes`
              : "No stored quotes"}
          </span>
          <span>
            {latestPoint
              ? `Latest quote ${formatDateTime(latestPoint.quoted_at)}`
              : ""}
          </span>
        </div>

        {historyError && (
          <p role="alert" className="mt-3 text-xs text-rose-800">
            {historyError}
          </p>
        )}
      </div>
    </section>
  );
}
