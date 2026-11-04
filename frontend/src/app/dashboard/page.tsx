import type { Metadata } from "next";

import MarketOverview from "@/components/MarketOverview";
import OrderTicket from "@/components/OrderTicket";
import PortfolioPanel from "@/components/PortfolioPanel";

export const metadata: Metadata = {
  title: "Dashboard | AutoInvest",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] text-[#1A2E45]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
            AutoInvest Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">
            Investment command center
          </h1>
          <p className="mt-2 text-sm text-[#526477]">
            Live market data, portfolio tracking, and simulated execution.
          </p>
        </section>
        <MarketOverview />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <PortfolioPanel />
          <OrderTicket />
        </section>
      </div>
    </main>
  );
}
