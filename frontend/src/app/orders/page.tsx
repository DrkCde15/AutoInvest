import type { Metadata } from "next";

import OrderHistory from "@/components/OrderHistory";
import OrderTicket from "@/components/OrderTicket";

export const metadata: Metadata = {
  title: "Orders | AutoInvest",
};

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] px-6 py-10 text-[#1A2E45]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
            Paper trading
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">
            Simulated orders
          </h1>
          <p className="mt-2 text-sm text-[#526477]">
            Place simulated orders and review executions from your portfolio.
          </p>
        </div>
        <div className="grid gap-6">
          <OrderTicket />
          <OrderHistory />
        </div>
      </div>
    </main>
  );
}
