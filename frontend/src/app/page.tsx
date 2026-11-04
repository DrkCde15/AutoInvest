import Link from "next/link";
import type { Metadata } from "next";

import LandingMarketPanel from "@/components/LandingMarketPanel";

export const metadata: Metadata = {
  title: "AutoInvest | Invista com clareza",
  description:
    "Acompanhe ativos, organize sua carteira e experimente operações simuladas no AutoInvest.",
};

const capabilities = [
  {
    title: "Mercado",
    detail: "Ativos e histórico de cotações disponíveis na plataforma",
  },
  {
    title: "Carteira",
    detail: "Saldo e posições da sua conta simulada",
  },
  {
    title: "Ordens",
    detail: "Compra e venda simuladas, sem conexão com corretoras",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] text-[#1A2E45]">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#356A9A]">
            Uma plataforma para acompanhar e aprender
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#1A2E45] sm:text-5xl lg:text-[4.25rem]">
            Seu dinheiro merece uma visão mais clara.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#526477] sm:text-lg">
            Acompanhe ativos, entenda sua carteira e experimente operações em
            ambiente simulado — sem colocar capital real em risco.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/cadastro"
              className="rounded-lg bg-[#356A9A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24547C]"
            >
              Criar minha conta
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[#AEBBCC] px-5 py-3 text-sm font-semibold text-[#304258] transition-colors hover:border-[#356A9A] hover:text-[#356A9A]"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-5 max-w-lg border-l-2 border-[#91B8D8] pl-3 text-sm leading-6 text-[#526477]">
            O AutoInvest não envia ordens reais, não acessa contas bancárias e
            não movimenta dinheiro.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_0.92fr] sm:items-start">
          <LandingMarketPanel />
          <section className="border-t-2 border-[#356A9A] bg-[#E7EDF3] px-5 py-5 sm:mt-12">
            <h2 className="text-base font-semibold text-[#1A2E45]">
              O que você encontra
            </h2>
            <dl className="mt-3 divide-y divide-[#CDD6E1]">
              {capabilities.map((capability) => (
                <div key={capability.title} className="py-3">
                  <dt className="text-sm font-semibold text-[#356A9A]">
                    {capability.title}
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-[#526477]">
                    {capability.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>

      <section className="border-y border-[#D7DFE8] bg-[#FDFEFF]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <h2 className="max-w-sm text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#1A2E45]">
            Uma conta para testar ideias antes de assumir riscos.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <p className="text-sm leading-6 text-[#526477]">
              <span className="mb-1 block font-semibold text-[#1A2E45]">
                Dados visíveis
              </span>
              Consulte os ativos e as cotações que a plataforma disponibiliza.
            </p>
            <p className="text-sm leading-6 text-[#526477]">
              <span className="mb-1 block font-semibold text-[#1A2E45]">
                Carteira isolada
              </span>
              Seu saldo simulado e suas posições pertencem à sua conta.
            </p>
            <p className="text-sm leading-6 text-[#526477]">
              <span className="mb-1 block font-semibold text-[#1A2E45]">
                Sem execução real
              </span>
              Cada ordem altera apenas os dados da carteira de demonstração.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
