import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { findInvite } from "@/lib/data/invites";
import { roleLabels } from "@/lib/auth/permissions";
import { AcceptInviteForm } from "./accept-invite-form";

export const metadata: Metadata = { title: "Accept your invite", robots: { index: false } };

async function Body({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // The link check depends on the clock, so it always runs at request time.
  await connection();
  const invite = await findInvite(token);
  if (!invite) {
    return (
      <>
        <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">This invite is no longer valid</h1>
        <p className="mt-3 text-lg text-muted">It has expired, was cancelled, or was already used. Ask the person who invited you to send a new one.</p>
        <p className="mt-8 text-[0.9375rem]">
          <Link href="/sign-in" className="link">
            Go to sign in
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em]">Join {invite.accountName}</h1>
      <p className="mt-3 text-lg text-muted">
        You were invited as {roleLabels[invite.role].label}. {roleLabels[invite.role].description}
      </p>
      <p className="mt-6 border-y border-border py-3 text-[0.9375rem]">
        <span className="text-muted">Invite for </span>
        <span className="font-medium">{invite.email}</span>
      </p>
      <AcceptInviteForm token={token} hasAccount={invite.hasAccount} />
    </>
  );
}

export default function InvitePage(props: PageProps<"/invite/[token]">) {
  return (
    <Suspense fallback={<p className="text-lg text-muted">Checking your invite…</p>}>
      <Body params={props.params} />
    </Suspense>
  );
}
