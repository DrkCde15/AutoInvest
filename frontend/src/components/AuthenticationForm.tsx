"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, login, register } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

type AuthenticationFormProps = {
  mode: "login" | "register";
};

const inputClassName =
  "mt-2 w-full rounded-lg border border-[#CDD6E1] bg-white px-4 py-3 text-sm text-[#1A2E45] outline-none transition-colors placeholder:text-[#8491A2] focus:border-[#356A9A] focus:ring-2 focus:ring-[#356A9A]/15";

export default function AuthenticationForm({
  mode,
}: AuthenticationFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register({ full_name: fullName.trim(), email, password });
      }

      const token = await login(email, password);
      setAccessToken(token.access_token);
      router.replace("/dashboard");
      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : isRegister
            ? "Could not create your account."
            : "Could not sign in.";
      setError(
        requestError instanceof ApiError && requestError.status === 401
          ? "E-mail ou senha inválidos."
          : requestError instanceof ApiError && requestError.status === 409
            ? "Este e-mail já possui uma conta. Entre com ela."
            : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#D7DFE8] bg-[#FDFEFF] p-6 shadow-[0_16px_48px_rgba(21,46,57,0.08)] sm:p-8">
      <div>
        <p className="text-sm font-medium text-[#356A9A]">
          {isRegister ? "Cadastro" : "Acesso à conta"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1A2E45]">
          {isRegister ? "Crie sua conta" : "Que bom ter você de volta"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#526477]">
          {isRegister
            ? "Uma conta pessoal para acompanhar sua carteira simulada."
            : "Entre para continuar acompanhando sua carteira e suas simulações."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {isRegister && (
          <label className="block text-sm font-medium text-[#304258]">
            Nome completo
            <input
              type="text"
              name="name"
              required
              minLength={1}
              maxLength={120}
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClassName}
              placeholder="Como podemos chamar você?"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-[#304258]">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="voce@exemplo.com"
          />
        </label>

        <label className="block text-sm font-medium text-[#304258]">
          Senha
          <input
            type="password"
            name="password"
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={128}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder={isRegister ? "Mínimo de 8 caracteres" : "Sua senha"}
          />
          {isRegister && (
            <span className="mt-2 block text-xs text-[#68778A]">
              Use pelo menos 8 caracteres.
            </span>
          )}
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#B75B4B]/30 bg-[#B75B4B]/10 px-4 py-3 text-sm text-[#8F3F34]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#356A9A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24547C] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? isRegister
              ? "Criando conta..."
              : "Entrando..."
            : isRegister
              ? "Criar conta"
              : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#526477]">
        {isRegister ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link
          href={isRegister ? "/login" : "/cadastro"}
          className="font-semibold text-[#356A9A] underline decoration-[#91B8D8] decoration-2 underline-offset-4 hover:text-[#24547C]"
        >
          {isRegister ? "Entrar" : "Criar conta"}
        </Link>
      </p>

      <p className="mt-5 border-t border-[#DDE4EC] pt-4 text-center text-xs leading-5 text-[#68778A]">
        Esta plataforma opera apenas em modo simulado. Nenhuma ordem ou
        transferência real é realizada.
      </p>
    </section>
  );
}
