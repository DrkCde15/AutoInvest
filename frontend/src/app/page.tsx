import AuthPanel from "@/components/AuthPanel";
import PaperTradingToggle from "@/components/PaperTradingToggle";

const marketSummary = [
  { label: "NASDAQ", value: "18,420", delta: "+1.24%" },
  { label: "B3", value: "124,800", delta: "+0.82%" },
  { label: "BTC", value: "$48.3k", delta: "+2.68%" },
  { label: "10Y Treasury", value: "4.38%", delta: "+0.12%" },
];

const holdings = [
  { symbol: "PETR4", quantity: 80, price: 36.45, allocation: 31.2 },
  { symbol: "HGLG11", quantity: 22, price: 98.2, allocation: 23.1 },
  { symbol: "IVVB11", quantity: 15, price: 281.1, allocation: 45.1 },
];

const strategyCards = [
  { name: "Mean Reversion", status: "Live", sharpe: 1.48 },
  { name: "Momentum Breakout", status: "Paper", sharpe: 1.21 },
  { name: "Macro Basket", status: "Backtest", sharpe: 1.63 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">
              AutoInvest Platform
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Investment command center</h1>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <AuthPanel />
            <PaperTradingToggle />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {marketSummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/30">
              <p className="text-sm text-slate-400">{item.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-semibold text-white">{item.value}</span>
                <span className="text-sm font-medium text-emerald-400">{item.delta}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Portfolio overview</h2>
              <span className="text-sm text-emerald-400">+12.84% YTD</span>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Total value</p>
                <p className="mt-2 text-2xl font-semibold text-white">R$ 46.7k</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Cash</p>
                <p className="mt-2 text-2xl font-semibold text-white">R$ 15k</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-4">
                <p className="text-slate-400">Exposure</p>
                <p className="mt-2 text-2xl font-semibold text-white">72%</p>
              </div>
            </div>

            <div className="space-y-4">
              {holdings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                  <div>
                    <p className="font-medium text-white">{holding.symbol}</p>
                    <p className="text-sm text-slate-400">{holding.quantity} positions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">R$ {holding.price.toFixed(2)}</p>
                    <p className="text-xs text-emerald-400">{holding.allocation}% allocation</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">Strategy engine</h2>
              <div className="mt-4 space-y-3">
                {strategyCards.map((strategy) => (
                  <div key={strategy.name} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{strategy.name}</p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                        {strategy.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Sharpe: {strategy.sharpe}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">Paper trading</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                All orders are executed in a simulated environment. No real money or broker integration is enabled in this MVP.
              </p>
              <button className="mt-5 rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
                Review order book
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
