import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findUser, readPendingTwoFactor } from "@/lib/auth/session";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = { title: "Two-factor check", robots: { index: false } };

/** "owner@example.com" becomes "o••••@example.com". */
function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}`;
}

async function SigningInAs() {
  const uid = await readPendingTwoFactor();
  const user = uid ? await findUser(uid) : null;
  if (!user) return null;
  return (
    <p className="mt-6 border-y border-border py-3 text-[0.9375rem]">
      <span className="text-muted">Signing in as </span>
      <span className="font-medium">{maskEmail(user.email)}</span>
    </p>
  );
}

export default function TwoFactorPage() {
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">One more step</h1>
      <p className="mt-3 text-lg text-muted">Enter the 6-digit code from your authenticator app.</p>
      <Suspense fallback={null}>
        <SigningInAs />
      </Suspense>
      <TwoFactorForm />
      <p className="mt-6 text-[0.9375rem] text-muted">In this preview the code is 123456.</p>
      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
        <Link href="/sign-in" className="link">
          Use a different account
        </Link>
        <Link href="/contact?topic=support" className="link">
          I lost my authenticator
        </Link>
      </p>
    </>
  );
}
