import type { Metadata } from "next";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = { title: "Two-factor check", robots: { index: false } };

export default function TwoFactorPage() {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <h1 className="text-2xl font-bold">Two-factor check</h1>
      <p className="mt-1 text-sm text-muted">Enter the 6-digit code from your authenticator app.</p>
      <TwoFactorForm />
      <p className="mt-4 text-xs text-muted">Demo code: 123456</p>
    </div>
  );
}
