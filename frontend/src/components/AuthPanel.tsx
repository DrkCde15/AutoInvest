"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError, getCurrentUser, type CurrentUser } from "@/lib/api";
import {
  AUTH_CHANGED_EVENT,
  clearAccessToken,
  getAccessToken,
} from "@/lib/auth";

export default function AuthPanel() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          clearAccessToken();
          if (isMounted) {
            setUser(null);
            setError("Your session expired. Sign in again.");
          }
        } else if (isMounted) {
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

  function handleLogout() {
    clearAccessToken();
    setUser(null);
    setError(null);
  }

  if (isChecking) {
    return <p className="text-xs text-[#68778A]">Checking session...</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <p className="text-xs text-[#68778A]">Signed in as</p>
          <p className="text-sm font-medium text-[#356A9A]">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-[#304258] hover:text-[#356A9A]"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#CDD6E1] px-3 py-1 text-xs font-medium text-[#304258] transition hover:border-[#91B8D8] hover:text-[#1A2E45]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-[#CDD6E1] px-4 py-2 text-sm font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#1A2E45]"
        >
          Sign in
        </Link>
        <Link
          href="/cadastro"
          className="rounded-full bg-[#356A9A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#24547C]"
        >
          Create account
        </Link>
      </div>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-rose-800">
          {error}
        </p>
      )}
    </div>
  );
}
