import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { findPasswordLink } from "@/lib/auth/links";
import { ChoosePasswordForm } from "./choose-password-form";

export const metadata: Metadata = { title: "Choose a password", robots: { index: false } };

async function Body({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // The link check depends on the clock, so it always runs at request time.
  await connection();
  const link = await findPasswordLink(token);
  if (!link) {
    return (
      <>
        <p className="mt-3 text-lg text-muted">This link has expired or was already used. Links work once and only for a short time.</p>
        <p className="mt-8 text-[0.9375rem]">
          <Link href="/reset-password" className="link">
            Send me a new link
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <p className="mt-3 text-lg text-muted">Pick a password you don&apos;t use anywhere else. Every device will be signed out when you save.</p>
      <ChoosePasswordForm token={token} />
    </>
  );
}

export default function ChoosePasswordPage(props: PageProps<"/reset-password/[token]">) {
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">Choose a password</h1>
      <Suspense fallback={<p className="mt-3 text-lg text-muted">Checking your link…</p>}>
        <Body params={props.params} />
      </Suspense>
    </>
  );
}
