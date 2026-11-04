"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  AUTH_CHANGED_EVENT,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth";

type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
};

type TokenResponse = {
  access_token: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AuthPanel() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const token = getAccessToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsChecking(false);
        }
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          clearAccessToken();
          if (isMounted) {
            setUser(null);
            setError("Your session expired. Sign in again.");
          }
          return;
        }
        if (!response.ok) {
          throw new Error(`Could not load your session (${response.status}).`);
        }

        const currentUser = (await response.json()) as CurrentUser;
        if (isMounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load your session.",
          );
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    function handleAuthChange() {
      setIsChecking(true);
      void loadUser();
    }

    void loadUser();
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Invalid email or password."
            : `Could not sign in (${response.status}).`,
        );
      }

      const token = (await response.json()) as TokenResponse;
      setAccessToken(token.access_token);
      setPassword("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setUser(null);
    setEmail("");
    setPassword("");
    setError(null);
  }

  if (isChecking) {
    return <p className="text-xs text-slate-500">Checking session...</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm font-medium text-cyan-300">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form
        onSubmit={handleLogin}
        className="flex flex-wrap items-center justify-end gap-2"
      >
        <input
          type="email"
          required
          autoComplete="email"
          aria-label="Email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-44 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
