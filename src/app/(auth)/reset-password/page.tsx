import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">Reset your password</h1>
      <p className="mt-3 text-lg text-muted">Enter your email and we will send you a link to choose a new password.</p>
      <ResetForm />
      <p className="mt-8 text-[0.9375rem]">
        <Link href="/sign-in" className="link">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
