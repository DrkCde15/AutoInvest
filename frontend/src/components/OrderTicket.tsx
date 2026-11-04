"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  ApiError,
  getAssets,
  getPortfolio,
  getPaperTradingStatus,
  submitSimulatedOrder,
  type Asset,
  type OrderSide,
  type Portfolio,
  type PaperTradingStatus,
  type SimulatedOrderResponse,
} from "@/lib/api";
import { AUTH_CHANGED_EVENT, clearAccessToken, getAccessToken } from "@/lib/auth";
import {
  notifyPortfolioChanged,
  PAPER_TRADING_CHANGED_EVENT,
  PORTFOLIO_CHANGED_EVENT,
} from "@/lib/events";
import { formatCurrency, formatQuantity, toNumber } from "@/lib/format";

export default function OrderTicket() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [status, setStatus] = useState<PaperTradingStatus | null>(null);
  const [symbol, setSymbol] = useState("PETR4");
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("1");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulatedOrderResponse | null>(null);

  const loadTicket = useCallback(async () => {
    if (!getAccessToken()) {
      setHasSession(false);
      setStatus(null);
      setPortfolio(null);
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setHasSession(true);
    setIsLoading(true);
    try {
      const [assetList, tradingStatus, currentPortfolio] = await Promise.all([
        getAssets(),
        getPaperTradingStatus(),
        getPortfolio(),
      ]);
      setAssets(assetList);
      setStatus(tradingStatus);
      setPortfolio(currentPortfolio);
      setSymbol((current) =>
        assetList.some((asset) => asset.symbol === current)
          ? current
          : (assetList[0]?.symbol ?? ""),
      );
      setError(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        setHasSession(false);
        setStatus(null);
        setPortfolio(null);
        setError("Your session expired. Sign in again.");
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load the order ticket.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadTicket();
    }, 0);
    window.addEventListener(AUTH_CHANGED_EVENT, loadTicket);
    window.addEventListener(PAPER_TRADING_CHANGED_EVENT, loadTicket);
    window.addEventListener(PORTFOLIO_CHANGED_EVENT, loadTicket);
    return () => {
      window.clearTimeout(kickoff);
      window.removeEventListener(AUTH_CHANGED_EVENT, loadTicket);
      window.removeEventListener(PAPER_TRADING_CHANGED_EVENT, loadTicket);
      window.removeEventListener(PORTFOLIO_CHANGED_EVENT, loadTicket);
    };
  }, [loadTicket]);

  const selectedAsset = assets.find((asset) => asset.symbol === symbol);
  const selectedHolding = portfolio?.holdings.find(
    (holding) => holding.symbol === symbol,
  );
  const parsedQuantity = Number(quantity);
  const isValidQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0;
  const assetPrice = selectedAsset ? toNumber(selectedAsset.price) : 0;
  const estimatedNotional =
    isValidQuantity && assetPrice > 0
      ? Math.round(assetPrice * parsedQuantity * 100) / 100
      : null;
  const availableCash = portfolio ? toNumber(portfolio.cash_balance) : 0;
  const heldQuantity = selectedHolding ? toNumber(selectedHolding.quantity) : 0;
  const maxBuyQuantity =
    assetPrice > 0
      ? Math.floor((availableCash / assetPrice) * 100_000_000) / 100_000_000
      : 0;
  const insufficientCash =
    side === "buy" &&
    estimatedNotional !== null &&
    portfolio !== null &&
    estimatedNotional > availableCash;
  const insufficientPosition =
    side === "sell" && isValidQuantity && parsedQuantity > heldQuantity;
  const orderLimitExceeded = insufficientCash || insufficientPosition;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!status?.enabled || !portfolio || isSubmitting) {
      return;
    }

    if (!isValidQuantity) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    if (insufficientCash) {
      setError(
        `Insufficient cash. Available: ${formatCurrency(availableCash)}; estimated order value: ${formatCurrency(estimatedNotional ?? 0)}.`,
      );
      return;
    }

    if (insufficientPosition) {
      setError(
        `Insufficient position. Available to sell: ${formatQuantity(heldQuantity)} ${symbol}.`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const order = await submitSimulatedOrder({
        symbol,
        side,
        quantity,
      });
      setResult(order);
      setQuantity("1");
      notifyPortfolioChanged();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        setHasSession(false);
        setStatus(null);
        setPortfolio(null);
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not submit the simulated order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEnabled = status?.enabled === true;

  return (
    <section className="rounded-3xl border border-[#D7DFE8] bg-gradient-to-br from-[#356A9A]/10 to-[#FDFEFF] p-6">
      <h2 className="text-lg font-semibold text-[#1A2E45]">Paper trading</h2>
      <p className="mt-2 text-sm leading-6 text-[#304258]">
        Orders execute against the latest stored quote in a simulated
        environment. No real money or broker integration is enabled.
      </p>

      {hasSession === null ? (
        <p className="mt-5 text-sm text-[#526477]">Checking session...</p>
      ) : !hasSession ? (
        <p className="mt-5 rounded-xl border border-dashed border-[#CDD6E1] bg-[#F1F4F8]/40 p-4 text-sm text-[#526477]">
          Sign in to place simulated orders.
        </p>
      ) : (
        <>
          {isLoading && !status && (
            <p className="mt-5 text-sm text-[#526477]">
              Loading paper-trading status...
            </p>
          )}

          {status && !status.enabled && (
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
              Simulated trading is paused. Enable it in the header to place
              orders.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}

          {status && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-[#304258]">
                  Asset
                  <select
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    required
                    className="rounded-lg border border-[#CDD6E1] bg-[#F1F4F8] px-3 py-2 text-sm text-[#1A2E45] focus:border-[#356A9A] focus:outline-none"
                  >
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} — {asset.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm text-[#304258]">
                  Quantity
                  <input
                    type="number"
                    min="0.00000001"
                    step="0.00000001"
                    required
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="rounded-lg border border-[#CDD6E1] bg-[#F1F4F8] px-3 py-2 text-sm text-[#1A2E45] focus:border-[#356A9A] focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                {(["buy", "sell"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={side === option}
                    onClick={() => setSide(option)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                      side === option
                        ? option === "buy"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-800"
                          : "border-rose-500 bg-rose-500/15 text-rose-800"
                        : "border-[#CDD6E1] text-[#526477] hover:border-[#91B8D8]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#526477]">
                <span>
                  {selectedAsset
                    ? `Latest quote ${formatCurrency(selectedAsset.price, selectedAsset.currency)}`
                    : "No quote available"}
                </span>
                <span className="uppercase tracking-wider">
                  {status.mode} mode
                </span>
              </div>

              {portfolio && selectedAsset && (
                <div className="rounded-xl border border-[#CDD6E1] bg-[#F1F4F8]/50 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#526477]">
                      {estimatedNotional === null
                        ? "Estimated order value"
                        : `Estimated order value: ${formatCurrency(estimatedNotional, selectedAsset.currency)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          side === "buy"
                            ? maxBuyQuantity.toFixed(8)
                            : heldQuantity.toFixed(8),
                        )
                      }
                      disabled={
                        side === "buy" ? maxBuyQuantity <= 0 : heldQuantity <= 0
                      }
                      className="shrink-0 text-xs font-medium text-[#356A9A] hover:text-[#24547C] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Use max
                    </button>
                  </div>
                  <p
                    className={`mt-2 text-xs ${
                      orderLimitExceeded ? "text-rose-800" : "text-[#526477]"
                    }`}
                  >
                    {side === "buy"
                      ? `Cash available: ${formatCurrency(availableCash)} · Maximum affordable: ${formatQuantity(maxBuyQuantity)} ${symbol}`
                      : `Available to sell: ${formatQuantity(heldQuantity)} ${symbol}`}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !isEnabled ||
                  isSubmitting ||
                  assets.length === 0 ||
                  !portfolio ||
                  !isValidQuantity ||
                  orderLimitExceeded
                }
                className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  side === "buy"
                    ? "bg-[#356A9A] text-white hover:bg-[#24547C]"
                    : "bg-[#B75B4B] text-white hover:bg-[#99483D]"
                }`}
              >
                {isSubmitting
                  ? "Submitting..."
                  : `Simulate ${side === "buy" ? "purchase" : "sale"}`}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-medium text-emerald-200">
                {result.message}
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                {result.side.toUpperCase()} {formatQuantity(result.quantity)}{" "}
                {result.symbol} at {formatCurrency(result.price)} ·{" "}
                {formatCurrency(result.notional)}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
