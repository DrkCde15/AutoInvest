"use client";

import { useCallback, useEffect, useState } from "react";

import { AUTH_CHANGED_EVENT, authHeaders, getAccessToken } from "@/lib/auth";

type PaperTradingStatus = {
  enabled: boolean;
  mode: string;
  message: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function PaperTradingToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!getAccessToken()) {
      setHasSession(false);
      setEnabled(null);
      setError(null);
      return;
    }

    setHasSession(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/paper-trading/status`, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        setEnabled(null);
        setError("Your session expired. Sign in again.");
        return;
      }
      if (!response.ok) {
        throw new Error(`Could not load paper-trading status (${response.status}).`);
      }

      const status = (await response.json()) as PaperTradingStatus;
      setEnabled(status.enabled);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load paper-trading status.",
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function refresh() {
      if (isMounted) {
        await loadStatus();
      }
    }

    void refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
    };
  }, [loadStatus]);

  async function toggleTrading() {
    if (enabled === null || isSaving || !hasSession) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/paper-trading/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (response.status === 401) {
        setEnabled(null);
        setHasSession(false);
        throw new Error("Your session expired. Sign in again.");
      }
      if (!response.ok) {
        throw new Error(`Could not update paper-trading status (${response.status}).`);
      }

      const status = (await response.json()) as PaperTradingStatus;
      setEnabled(status.enabled);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update paper-trading status.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        aria-pressed={enabled ?? false}
        disabled={!hasSession || enabled === null || isSaving}
        onClick={toggleTrading}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
          enabled
            ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
            : "border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
        }`}
      >
        {!hasSession
          ? "Sign in to manage paper trading"
          : enabled === null
            ? "Loading paper trading..."
            : isSaving
              ? "Updating..."
              : enabled
                ? "Simulated trading active"
                : "Simulated trading paused"}
      </button>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
