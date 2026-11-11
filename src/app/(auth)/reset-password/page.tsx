import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">Enter your email and we&apos;ll send you a link to choose a new password.</p>
      <ResetForm />
      <p className="mt-6 text-sm">
        <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
