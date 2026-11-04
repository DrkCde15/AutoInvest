import type { Metadata } from "next";

import PlannedFeature from "@/components/PlannedFeature";

export const metadata: Metadata = {
  title: "Backtesting | AutoInvest",
};

export default function BacktestingPage() {
  return (
    <PlannedFeature
      title="Backtesting"
      description="Historical strategy evaluation is planned, but the MVP does not yet include a backtest engine or validated historical dataset."
      items={[
        "Select a strategy and historical period",
        "Account for fees and slippage assumptions",
        "Compare return, drawdown, and risk metrics",
        "Export reproducible simulation results",
      ]}
    />
  );
}
