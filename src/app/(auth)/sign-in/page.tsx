import type { Metadata } from "next";
import { demoLogins, DEMO_PASSWORD } from "@/lib/data/seed";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <>
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back. Manage your sites, billing and team.</p>
        <SignInForm />
      </div>
      <section aria-labelledby="demo-heading" className="rounded-[20px] border border-dashed border-primary/40 bg-primary-soft/60 p-5">
        <h2 id="demo-heading" className="text-sm font-semibold">
          Demo accounts
        </h2>
        <p className="mt-1 text-xs text-muted">
          This preview uses demo data. Password for every account: <code className="font-mono font-semibold text-foreground">{DEMO_PASSWORD}</code>. Accounts with 2FA use code{" "}
          <code className="font-mono font-semibold text-foreground">123456</code>.
        </p>
        <ul className="mt-3 grid gap-2 text-sm">
          {demoLogins.map((d) => (
            <li key={d.email} className="rounded-[10px] bg-surface px-3 py-2">
              <p className="font-medium">{d.label}</p>
              <p className="font-mono text-xs text-muted">{d.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
