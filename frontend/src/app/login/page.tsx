import type { Metadata } from "next";

import AuthenticationForm from "@/components/AuthenticationForm";

export const metadata: Metadata = {
  title: "Entrar | AutoInvest",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F1F4F8] px-6 py-10 text-[#1A2E45] sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-20">
        <div className="order-2 max-w-xl py-4 lg:order-none">
          <p className="text-sm font-medium text-[#356A9A]">
            Sua área de investimentos
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#1A2E45] sm:text-5xl">
            Acompanhe sua carteira com tranquilidade.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#526477]">
            Entre para consultar seu saldo, suas posições e o histórico de
            operações simuladas.
          </p>
          <div className="mt-8 border-y border-[#CDD6E1]">
            <p className="py-4 text-sm leading-6 text-[#526477]">
              <span className="font-semibold text-[#1A2E45]">
                Sua conta é só sua.
              </span>{" "}
              Carteira e ordens são separadas por usuário.
            </p>
            <p className="border-t border-[#CDD6E1] py-4 text-sm leading-6 text-[#526477]">
              <span className="font-semibold text-[#1A2E45]">
                Sem corretora conectada.
              </span>{" "}
              O ambiente serve apenas para simular.
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-none">
          <AuthenticationForm mode="login" />
        </div>
      </div>
    </main>
  );
}
