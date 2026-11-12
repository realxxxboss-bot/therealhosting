import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { demoLogins, DEMO_PASSWORD } from "@/lib/data/seed";
import { usesSampleDatabase } from "@/lib/db";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const notices: Record<string, string> = {
  password: "Your password is saved. Sign in with it now.",
  invite: "You have joined the account. Sign in to open it.",
};

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const query = await searchParams;
  const notice = query.password === "updated" ? notices.password : query.invite === "accepted" ? notices.invite : undefined;
  // Sample sign-ins exist only in the sample database. With a real database they are never shown.
  const sample = usesSampleDatabase();
  return <SignInForm demoLogins={sample ? demoLogins : []} demoPassword={sample ? DEMO_PASSWORD : ""} notice={notice} />;
}

export default function SignInPage(props: PageProps<"/sign-in">) {
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">Sign in</h1>
      <p className="mt-3 text-lg text-muted">Your sites, invoices and support, in one place.</p>
      <Suspense fallback={<div className="mt-8 h-64" aria-hidden />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
