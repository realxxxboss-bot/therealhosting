import type { Metadata } from "next";
import { demoLogins, DEMO_PASSWORD } from "@/lib/data/seed";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">Sign in</h1>
      <p className="mt-3 text-lg text-muted">Your sites, invoices and support, in one place.</p>
      <SignInForm demoLogins={demoLogins} demoPassword={DEMO_PASSWORD} />
    </>
  );
}
