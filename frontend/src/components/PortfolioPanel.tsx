"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, getPortfolio, type Portfolio } from "@/lib/api";
import { AUTH_CHANGED_EVENT, clearAccessToken, getAccessToken } from "@/lib/auth";
import { PORTFOLIO_CHANGED_EVENT } from "@/lib/events";
import {
  changeTone,
  formatCurrency,
  formatPercent,
  formatQuantity,
  toNumber,
} from "@/lib/format";

export default function PortfolioPanel() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!getAccessToken()) {
      setHasSession(false);
      setPortfolio(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setHasSession(true);
    setIsLoading(true);
    try {
      const data = await getPortfolio();
      setPortfolio(data);
      setError(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        setPortfolio(null);
        setHasSession(false);
        setError("Your session expired. Sign in again.");
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load your portfolio.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadPortfolio();
    }, 0);
    window.addEventListener(AUTH_CHANGED_EVENT, loadPortfolio);
    window.addEventListener(PORTFOLIO_CHANGED_EVENT, loadPortfolio);
    return () => {
      window.clearTimeout(kickoff);
      window.removeEventListener(AUTH_CHANGED_EVENT, loadPortfolio);
      window.removeEventListener(PORTFOLIO_CHANGED_EVENT, loadPortfolio);
    };
  }, [loadPortfolio]);

  const invested = portfolio
    ? toNumber(portfolio.total_value) - toNumber(portfolio.cash_balance)
    : 0;

  return (
    <section className="rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1A2E45]">Portfolio</h2>
          <p className="mt-1 text-sm text-[#526477]">
            Positions and cash from your simulated account.
          </p>
        </div>
        {hasSession && (
          <button
            type="button"
            onClick={() => void loadPortfolio()}
            disabled={isLoading}
            className="rounded-full border border-[#CDD6E1] px-3 py-1.5 text-xs font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#356A9A] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Refreshing..." : "Refresh portfolio"}
          </button>
        )}
      </div>

      {hasSession === null ? (
        <p className="mt-6 text-sm text-[#526477]">Checking session...</p>
      ) : !hasSession ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#CDD6E1] bg-[#F1F4F8]/40 p-6">
          <p className="font-medium text-[#1A2E45]">Sign in to view your portfolio</p>
          <p className="mt-2 text-sm text-[#526477]">
            Use the demo account or create your own to track positions and cash.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <p className="text-sm text-[#526477]">Total value</p>
              <p className="mt-2 text-2xl font-semibold text-[#1A2E45]">
                {portfolio ? formatCurrency(portfolio.total_value) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <p className="text-sm text-[#526477]">Cash available</p>
              <p className="mt-2 text-2xl font-semibold text-[#1A2E45]">
                {portfolio ? formatCurrency(portfolio.cash_balance) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <p className="text-sm text-[#526477]">Unrealized return</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  portfolio ? changeTone(portfolio.total_return_pct) : "text-[#1A2E45]"
                }`}
              >
                {portfolio ? formatPercent(portfolio.total_return_pct) : "—"}
              </p>
              <p className="mt-1 text-xs text-[#68778A]">
                Invested {formatCurrency(invested)}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {portfolio && portfolio.holdings.length > 0 ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D7DFE8] text-xs uppercase tracking-wider text-[#68778A]">
                    <th scope="col" className="pb-3 font-medium">
                      Asset
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Quantity
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Avg price
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Current
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Market value
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => (
                    <tr
                      key={holding.symbol}
                      className="border-b border-[#D7DFE8]/60 last:border-0"
                    >
                      <td className="py-3 font-medium text-[#1A2E45]">
                        {holding.symbol}
                      </td>
                      <td className="py-3 text-right text-[#304258]">
                        {formatQuantity(holding.quantity)}
                      </td>
                      <td className="py-3 text-right text-[#304258]">
                        {formatCurrency(holding.average_price)}
                      </td>
                      <td className="py-3 text-right text-[#304258]">
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td className="py-3 text-right text-[#1A2E45]">
                        {formatCurrency(holding.market_value)}
                      </td>
                      <td className="py-3 text-right text-[#526477]">
                        {formatPercent(holding.allocation_pct, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="rounded-xl border border-dashed border-[#CDD6E1] bg-[#F1F4F8]/40 p-6 text-sm text-[#526477]">
                {isLoading && !portfolio
                  ? "Loading portfolio..."
                  : "No positions yet. Use the order ticket to simulate a purchase."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
