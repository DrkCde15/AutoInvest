"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ApiError,
  getPaperTradingStatus,
  setPaperTradingEnabled,
} from "@/lib/api";
import { AUTH_CHANGED_EVENT, getAccessToken } from "@/lib/auth";
import { notifyPaperTradingChanged } from "@/lib/events";

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
      const status = await getPaperTradingStatus();
      setEnabled(status.enabled);
      setError(null);
    } catch (requestError) {
      setEnabled(null);
      setError(
        requestError instanceof ApiError && requestError.status === 401
          ? "Your session expired. Sign in again."
          : requestError instanceof Error
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
      const status = await setPaperTradingEnabled(!enabled);
      setEnabled(status.enabled);
      notifyPaperTradingChanged(status.enabled);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setEnabled(null);
        setHasSession(false);
      }
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
            ? "border-[#356A9A] bg-[#356A9A]/10 text-[#356A9A] hover:bg-[#356A9A]/20"
            : "border-amber-500 bg-amber-500/10 text-amber-900 hover:bg-amber-500/20"
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
        <p role="alert" className="max-w-xs text-right text-xs text-rose-800">
          {error}
        </p>
      )}
    </div>
  );
}
