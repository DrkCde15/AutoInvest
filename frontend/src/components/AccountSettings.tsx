"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ApiError,
  getCurrentUser,
  type CurrentUser,
} from "@/lib/api";
import {
  AUTH_CHANGED_EVENT,
  clearAccessToken,
  getAccessToken,
} from "@/lib/auth";

export default function AccountSettings() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setHasSession(false);
      setError(null);
      return;
    }

    setHasSession(true);
    try {
      setUser(await getCurrentUser());
      setError(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        setUser(null);
        setHasSession(false);
        setError("Your session expired. Sign in again.");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load account settings.",
        );
      }
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void loadUser();
    }, 0);
    window.addEventListener(AUTH_CHANGED_EVENT, loadUser);
    return () => {
      window.clearTimeout(kickoff);
      window.removeEventListener(AUTH_CHANGED_EVENT, loadUser);
    };
  }, [loadUser]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
        <h2 className="text-lg font-semibold text-[#1A2E45]">Account</h2>
        {hasSession === null ? (
          <p className="mt-4 text-sm text-[#526477]">Checking session...</p>
        ) : !hasSession ? (
          <p className="mt-4 text-sm text-[#526477]">
            Sign in to view your account information.
          </p>
        ) : error ? (
          <p role="alert" className="mt-4 text-sm text-rose-800">{error}</p>
        ) : user ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <dt className="text-sm text-[#526477]">Name</dt>
              <dd className="mt-1 font-medium text-[#1A2E45]">{user.full_name}</dd>
            </div>
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <dt className="text-sm text-[#526477]">Email</dt>
              <dd className="mt-1 font-medium text-[#1A2E45]">{user.email}</dd>
            </div>
            <div className="rounded-xl bg-[#E7EDF3] p-4">
              <dt className="text-sm text-[#526477]">Account status</dt>
              <dd className="mt-1 font-medium text-emerald-800">
                {user.is_active ? "Active" : "Inactive"}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
        <h2 className="text-lg font-semibold text-[#1A2E45]">Trading safety</h2>
        <p className="mt-2 text-sm leading-6 text-[#526477]">
          This MVP supports paper trading only. Use the control in the header to
          pause or resume simulated orders. No real broker or money movement is
          configured.
        </p>
      </section>

      <section className="rounded-3xl border border-dashed border-[#CDD6E1] bg-[#FDFEFF]/50 p-6">
        <h2 className="text-lg font-semibold text-[#1A2E45]">More preferences</h2>
        <p className="mt-2 text-sm leading-6 text-[#526477]">
          Profile editing, password changes, and notification preferences are
          not available yet. No unsaved or non-persistent settings are shown as
          editable.
        </p>
      </section>
    </div>
  );
}
