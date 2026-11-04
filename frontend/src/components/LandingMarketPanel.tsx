"use client";

import { useCallback, useEffect, useState } from "react";

import { getAssets, type Asset } from "@/lib/api";
import { formatCurrency, formatPercent, toNumber } from "@/lib/format";

export default function LandingMarketPanel() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      setAssets((await getAssets()).slice(0, 4));
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as cotações.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadAssets();
    }, 0);
    return () => window.clearTimeout(kickoff);
  }, [loadAssets]);

  return (
    <section
      aria-labelledby="market-panel-title"
      className="border border-[#CDD6E1] bg-[#FDFEFF]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#DDE4EC] px-5 py-4">
        <div>
          <p className="text-xs font-medium text-[#68778A]">
            Dados da API AutoInvest
          </p>
          <h2
            id="market-panel-title"
            className="mt-1 text-lg font-semibold text-[#1A2E45]"
          >
            Mercado acompanhado
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void loadAssets()}
          disabled={isLoading}
          aria-label="Atualizar cotações"
          className="rounded-md border border-[#CDD6E1] px-3 py-2 text-xs font-medium text-[#356A9A] hover:border-[#356A9A] disabled:cursor-wait disabled:opacity-50"
        >
          {isLoading ? "Carregando" : "Atualizar"}
        </button>
      </div>

      {error && (
        <div role="alert" className="px-5 py-5">
          <p className="text-sm font-medium text-[#1A2E45]">
            Cotações indisponíveis
          </p>
          <p className="mt-1 text-xs leading-5 text-[#68778A]">
            Inicie a API para consultar os ativos.
          </p>
          <button
            type="button"
            onClick={() => void loadAssets()}
            className="mt-3 text-xs font-semibold text-[#356A9A] underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!error && isLoading && (
        <p className="px-5 py-8 text-sm text-[#68778A]">
          Consultando cotações...
        </p>
      )}

      {!error && !isLoading && assets.length === 0 && (
        <p className="px-5 py-8 text-sm text-[#68778A]">
          Nenhum ativo disponível. Confira a configuração da API.
        </p>
      )}

      {!error && assets.length > 0 && (
        <div className="divide-y divide-[#E5EAF0]">
          {assets.map((asset) => (
            <div
              key={asset.symbol}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-[#1A2E45]">{asset.symbol}</p>
                <p className="mt-0.5 max-w-48 truncate text-xs text-[#68778A]">
                  {asset.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-data text-sm font-medium text-[#1A2E45]">
                  {formatCurrency(asset.price, asset.currency)}
                </p>
                <p
                  className={`mt-1 font-data text-xs ${
                    toNumber(asset.change_pct) >= 0
                      ? "text-[#356A9A]"
                      : "text-[#B75B4B]"
                  }`}
                >
                  {formatPercent(asset.change_pct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="border-t border-[#DDE4EC] px-5 py-3 text-xs leading-5 text-[#68778A]">
        Cotações armazenadas para consulta. Não são uma oferta de compra ou venda.
      </p>
    </section>
  );
}
