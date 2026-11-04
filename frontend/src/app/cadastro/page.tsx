import type { Metadata } from "next";

import AuthenticationForm from "@/components/AuthenticationForm";

export const metadata: Metadata = {
  title: "Criar conta | AutoInvest",
};

export default function RegistrationPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F1F4F8] px-6 py-10 text-[#1A2E45] sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-20">
        <div className="order-2 max-w-xl py-4 lg:order-none">
          <p className="text-sm font-medium text-[#356A9A]">
            Comece pela simulação
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#1A2E45] sm:text-5xl">
            Organize suas ideias antes de investir.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#526477]">
            Crie seu espaço pessoal para acompanhar ativos, montar uma carteira
            simulada e testar operações.
          </p>
          <div className="mt-8 border-l-[3px] border-[#91B8D8] bg-[#E7EDF3] px-5 py-4">
            <p className="text-sm font-semibold text-[#1A2E45]">
              Nenhum dinheiro é movimentado.
            </p>
            <p className="mt-1 text-sm leading-6 text-[#526477]">
              O AutoInvest não se conecta a bancos ou corretoras e não envia
              ordens reais.
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-none">
          <AuthenticationForm mode="register" />
        </div>
      </div>
    </main>
  );
}
