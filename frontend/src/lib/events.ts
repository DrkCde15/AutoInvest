export const PORTFOLIO_CHANGED_EVENT = "autoinvest:portfolio-changed";
export const PAPER_TRADING_CHANGED_EVENT = "autoinvest:paper-trading-changed";

export function notifyPortfolioChanged(): void {
  window.dispatchEvent(new Event(PORTFOLIO_CHANGED_EVENT));
}

export function notifyPaperTradingChanged(enabled: boolean): void {
  window.dispatchEvent(
    new CustomEvent(PAPER_TRADING_CHANGED_EVENT, {
      detail: { enabled },
    }),
  );
}
