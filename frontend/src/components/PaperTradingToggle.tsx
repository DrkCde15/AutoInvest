"use client";

import { useEffect, useState } from "react";

type PaperTradingStatus = {
  enabled: boolean;
  mode: string;
  message: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function PaperTradingToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const response = await fetch(`${apiUrl}/api/v1/paper-trading/status`);
        if (!response.ok) {
          throw new Error(`Could not load paper-trading status (${response.status}).`);
        }

        const status = (await response.json()) as PaperTradingStatus;
        if (isMounted) {
          setEnabled(status.enabled);
          setError(null);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load paper-trading status.",
          );
        }
      }
    }

    void loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  async function toggleTrading() {
    if (enabled === null || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/paper-trading/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
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
        disabled={enabled === null || isSaving}
        onClick={toggleTrading}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
          enabled
            ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
            : "border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
        }`}
      >
        {enabled === null
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
