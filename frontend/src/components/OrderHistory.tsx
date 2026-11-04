"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, getPaperOrders, type PaperOrder } from "@/lib/api";
import { AUTH_CHANGED_EVENT, clearAccessToken, getAccessToken } from "@/lib/auth";
import { PORTFOLIO_CHANGED_EVENT } from "@/lib/events";
import {
  formatCurrency,
  formatDateTime,
  formatQuantity,
} from "@/lib/format";

export default function OrderHistory() {
  const [orders, setOrders] = useState<PaperOrder[]>([]);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!getAccessToken()) {
      setHasSession(false);
      setOrders([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setHasSession(true);
    setIsLoading(true);
    try {
      setOrders(await getPaperOrders());
      setError(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        setHasSession(false);
        setOrders([]);
        setError("Your session expired. Sign in again.");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load simulated order history.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    window.addEventListener(AUTH_CHANGED_EVENT, loadOrders);
    window.addEventListener(PORTFOLIO_CHANGED_EVENT, loadOrders);
    return () => {
      window.clearTimeout(kickoff);
      window.removeEventListener(AUTH_CHANGED_EVENT, loadOrders);
      window.removeEventListener(PORTFOLIO_CHANGED_EVENT, loadOrders);
    };
  }, [loadOrders]);

  return (
    <section className="rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1A2E45]">Order history</h2>
          <p className="mt-1 text-sm text-[#526477]">
            Recent simulated orders for your account.
          </p>
        </div>
        {hasSession && (
          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={isLoading}
            className="rounded-full border border-[#CDD6E1] px-3 py-1.5 text-xs font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#356A9A] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>

      {hasSession === null ? (
        <p className="mt-6 text-sm text-[#526477]">Checking session...</p>
      ) : !hasSession ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#CDD6E1] bg-[#F1F4F8]/40 p-5 text-sm text-[#526477]">
          Sign in to view your simulated order history.
        </p>
      ) : error ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </p>
      ) : isLoading && orders.length === 0 ? (
        <p className="mt-6 text-sm text-[#526477]">Loading order history...</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#CDD6E1] bg-[#F1F4F8]/40 p-5 text-sm text-[#526477]">
          No simulated orders yet. Create one with the order ticket.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#D7DFE8] text-xs uppercase tracking-wider text-[#68778A]">
                <th scope="col" className="pb-3 font-medium">Date</th>
                <th scope="col" className="pb-3 font-medium">Asset</th>
                <th scope="col" className="pb-3 font-medium">Side</th>
                <th scope="col" className="pb-3 text-right font-medium">Quantity</th>
                <th scope="col" className="pb-3 text-right font-medium">Price</th>
                <th scope="col" className="pb-3 text-right font-medium">Total</th>
                <th scope="col" className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.order_id}
                  className="border-b border-[#D7DFE8]/60 last:border-0"
                >
                  <td className="py-3 text-[#526477]">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="py-3 font-medium text-[#1A2E45]">{order.symbol}</td>
                  <td
                    className={`py-3 font-medium uppercase ${
                      order.side === "buy" ? "text-emerald-800" : "text-rose-800"
                    }`}
                  >
                    {order.side}
                  </td>
                  <td className="py-3 text-right text-[#304258]">
                    {formatQuantity(order.quantity)}
                  </td>
                  <td className="py-3 text-right text-[#304258]">
                    {formatCurrency(order.price)}
                  </td>
                  <td className="py-3 text-right text-[#1A2E45]">
                    {formatCurrency(order.notional)}
                  </td>
                  <td className="py-3 text-right text-[#356A9A]">
                    {order.simulated_executed ? "Simulated" : order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
