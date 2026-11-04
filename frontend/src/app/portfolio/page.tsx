import type { Metadata } from "next";

import PortfolioPanel from "@/components/PortfolioPanel";

export const metadata: Metadata = {
  title: "Portfolio | AutoInvest",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] px-6 py-10 text-[#1A2E45]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">Portfolio</h1>
          <p className="mt-2 text-sm text-[#526477]">
            Cash balance, simulated positions, and allocation.
          </p>
        </div>
        <PortfolioPanel />
      </div>
    </main>
  );
}
