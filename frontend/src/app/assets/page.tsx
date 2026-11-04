import type { Metadata } from "next";

import MarketOverview from "@/components/MarketOverview";

export const metadata: Metadata = {
  title: "Assets | AutoInvest",
};

export default function AssetsPage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] px-6 py-10 text-[#1A2E45]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
            Market data
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">
            Assets and quotes
          </h1>
          <p className="mt-2 text-sm text-[#526477]">
            Browse available instruments and their stored price history.
          </p>
        </div>
        <MarketOverview />
      </div>
    </main>
  );
}
