import type { Metadata } from "next";

import AccountSettings from "@/components/AccountSettings";

export const metadata: Metadata = {
  title: "Settings | AutoInvest",
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#F1F4F8] px-6 py-10 text-[#1A2E45]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
            Preferences
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">Settings</h1>
          <p className="mt-2 text-sm text-[#526477]">
            Account information and simulated trading safety.
          </p>
        </div>
        <AccountSettings />
      </div>
    </main>
  );
}
