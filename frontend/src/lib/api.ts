import { authHeaders } from "@/lib/auth";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const API_PREFIX = "/api/v1";

export type Asset = {
  symbol: string;
  name: string;
  asset_type: string;
  price: string;
  change_pct: string;
  market: string;
  currency: string;
};

export type PricePoint = {
  price: string;
  change_pct: string;
  quoted_at: string;
};

export type Holding = {
  symbol: string;
  quantity: string;
  average_price: string;
  current_price: string;
  market_value: string;
  allocation_pct: string;
};

export type Portfolio = {
  total_value: string;
  total_return_pct: string;
  cash_balance: string;
  holdings: Holding[];
};

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
};

export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type PaperTradingStatus = {
  enabled: boolean;
  mode: string;
  message: string;
};

export type OrderSide = "buy" | "sell";

export type SimulatedOrderRequest = {
  symbol: string;
  side: OrderSide;
  quantity: string;
  order_type?: "market" | "limit";
  strategy_name?: string;
};

export type SimulatedOrderResponse = {
  order_id: string;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  notional: string;
  status: string;
  message: string;
  simulated_executed: boolean;
};

export type PaperOrder = {
  order_id: string;
  symbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
  notional: string;
  order_type: string;
  strategy_name: string | null;
  status: string;
  simulated_executed: boolean;
  created_at: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, init);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    const body = (await response.json().catch(() => null)) as {
      detail?: unknown;
    } | null;

    if (typeof body?.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body?.detail)) {
      const firstError = body.detail[0] as { msg?: string } | undefined;
      if (firstError?.msg) {
        message = firstError.msg;
      }
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function authorized(path: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  };
}

export function getAssets(): Promise<Asset[]> {
  return request<Asset[]>("/assets");
}

export function getAsset(symbol: string): Promise<Asset> {
  return request<Asset>(`/assets/${encodeURIComponent(symbol)}`);
}

export function getPriceHistory(
  symbol: string,
  limit = 60,
): Promise<PricePoint[]> {
  return request<PricePoint[]>(
    `/assets/${encodeURIComponent(symbol)}/prices?limit=${limit}`,
  );
}

export function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
}

export function register(payload: RegisterRequest): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me", authorized("/auth/me"));
}

export function getPortfolio(): Promise<Portfolio> {
  return request<Portfolio>("/portfolio", authorized("/portfolio"));
}

export function getPaperTradingStatus(): Promise<PaperTradingStatus> {
  return request<PaperTradingStatus>(
    "/paper-trading/status",
    authorized("/paper-trading/status"),
  );
}

export function setPaperTradingEnabled(
  enabled: boolean,
): Promise<PaperTradingStatus> {
  return request<PaperTradingStatus>("/paper-trading/status", {
    ...authorized("/paper-trading/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    }),
    body: JSON.stringify({ enabled }),
  });
}

export function submitSimulatedOrder(
  order: SimulatedOrderRequest,
): Promise<SimulatedOrderResponse> {
  return request<SimulatedOrderResponse>("/paper-trading/orders", {
    ...authorized("/paper-trading/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),
    body: JSON.stringify({
      order_type: "market",
      strategy_name: "manual",
      ...order,
    }),
  });
}

export function getPaperOrders(limit = 50): Promise<PaperOrder[]> {
  return request<PaperOrder[]>(
    `/paper-trading/orders?limit=${encodeURIComponent(String(limit))}`,
    authorized("/paper-trading/orders"),
  );
}
