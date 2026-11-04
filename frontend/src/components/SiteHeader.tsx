"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthPanel from "@/components/AuthPanel";
import PaperTradingToggle from "@/components/PaperTradingToggle";
import ThemeToggle from "@/components/ThemeToggle";

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/assets", label: "Assets" },
  { href: "/orders", label: "Orders" },
  { href: "/strategies", label: "Strategies" },
  { href: "/backtesting", label: "Backtesting" },
  { href: "/settings", label: "Settings" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/cadastro";

  return (
    <header className="border-b border-[#D7DFE8] bg-[#FDFEFF]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-lg border border-[#356A9A] text-sm font-semibold text-[#356A9A]"
            >
              Ai
            </span>
            <span>
              <span className="block font-semibold text-[#1A2E45]">
                AutoInvest
              </span>
              <span className="block text-xs text-[#68778A]">
                Investir começa com clareza
              </span>
            </span>
          </Link>
          {isPublicRoute ? (
            pathname === "/" ? (
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                  href="/login"
                  className="rounded-lg border border-[#AEBBCC] px-4 py-2 text-sm font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#356A9A]"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="rounded-lg bg-[#356A9A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#24547C]"
                >
                  Criar conta
                </Link>
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-[#526477] hover:text-[#356A9A]"
                >
                  Voltar ao início
                </Link>
                <ThemeToggle />
              </div>
            )
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <AuthPanel />
              <PaperTradingToggle />
              <ThemeToggle />
            </div>
          )}
        </div>

        {!isPublicRoute && (
          <nav
            aria-label="Main navigation"
            className="-mx-1 flex gap-1 overflow-x-auto pb-1"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#356A9A]/10 text-[#356A9A]"
                      : "text-[#526477] hover:bg-[#FDFEFF] hover:text-[#1A2E45]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
