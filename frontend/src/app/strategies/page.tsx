import type { Metadata } from "next";

import PlannedFeature from "@/components/PlannedFeature";

export const metadata: Metadata = {
  title: "Strategies | AutoInvest",
};

export default function StrategiesPage() {
  return (
    <PlannedFeature
      title="Strategies"
      description="A future workspace for designing and monitoring quantitative strategies. Strategy configuration and execution are not connected to the MVP backend yet."
      items={[
        "Create and version strategy definitions",
        "Choose supported assets and signals",
        "Review risk limits before a simulation",
        "Run strategies in paper-trading mode only",
      ]}
    />
  );
}
