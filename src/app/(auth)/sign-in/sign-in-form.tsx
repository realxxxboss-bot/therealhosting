"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn } from "@/app/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface DemoLogin {
  email: string;
  label: string;
  description: string;
}

export function SignInForm({ demoLogins, demoPassword, notice }: { demoLogins: readonly DemoLogin[]; demoPassword: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const err = state.errors ?? {};

  return (
    <>
      <form action={action} className="mt-8 grid gap-5" noValidate>
        {state.message ? <Alert tone="danger">{state.message}</Alert> : notice ? <Alert tone="success">{notice}</Alert> : null}
        <Field label="Email" htmlFor="email" error={err.email}>
          <Input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" required aria-invalid={Boolean(err.email)} />
        </Field>
        <Field label="Password" htmlFor="password" error={err.password}>
          <Input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-base" required aria-invalid={Boolean(err.password)} />
        </Field>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-[0.9375rem]">
          <Link href="/reset-password" className="link">
            Forgot your password?
          </Link>
        </p>
      </form>

      {demoLogins.length > 0 ? (
        <section aria-labelledby="demo-heading" className="mt-12">
          <h2 id="demo-heading" className="font-semibold">
            Try a demo account
          </h2>
          <p className="mt-1 text-[0.9375rem] text-muted">This preview runs on sample data. Pick an account to fill in the form. Accounts with two-factor use the code 123456.</p>
          <ul className="mt-4 border-t border-foreground">
            {demoLogins.map((demo) => {
              const selected = email === demo.email;
              return (
                <li key={demo.email} className="border-b border-border">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword(demoPassword);
                    }}
                    className={cn("grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 px-3 py-3 text-left transition-colors duration-200 hover:bg-surface-2", selected && "bg-primary-soft hover:bg-primary-soft")}
                  >
                    <span className="font-medium">{demo.label}</span>
                    <span className="text-sm text-muted">{selected ? "Filled in" : "Use"}</span>
                    <span className="col-span-2 text-sm text-muted">{demo.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
