export function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export function formatCurrency(
  value: string | number,
  currency = "BRL",
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(toNumber(value));
}

export function formatPercent(
  value: string | number,
  signed = true,
): string {
  const number = toNumber(value);
  const sign = signed && number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

export function formatQuantity(value: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 8,
  }).format(toNumber(value));
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function changeTone(value: string | number): string {
  return toNumber(value) >= 0 ? "text-emerald-800" : "text-rose-800";
}
