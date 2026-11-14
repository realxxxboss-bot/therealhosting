import type { ComponentType } from "react";
import Terms from "./terms.mdx";
import Privacy from "./privacy.mdx";
import Refund from "./refund.mdx";
import AcceptableUse from "./acceptable-use.mdx";
import Sla from "./sla.mdx";
import Dpa from "./dpa.mdx";
import Subprocessors from "./subprocessors.mdx";
import Cancellation from "./cancellation.mdx";
import Complaints from "./complaints.mdx";

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  /** ISO date of the last change. */
  updated: string;
  /** The document in a few plain sentences. A reading aid, not a replacement for the text. */
  summary: string[];
  Body: ComponentType;
}

/** Every document is a draft until the owner has had it reviewed (docs/OWNER-ACTIONS.md). */
export const legalDraft = true;

export const legalDocs: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    description: "The agreement between you and Zaffre for our hosting services.",
    updated: "2026-11-13",
    summary: ["You pay a fixed price for a package and we host and manage the sites in it.", "Your content stays yours. You can leave at any time and take a copy with you.", "The price you sign up at does not rise at renewal.", "If you are a consumer, you can cancel within 14 days and keep your statutory rights."],
    Body: Terms,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What personal data we collect, where it is stored, and your rights.",
    updated: "2026-11-13",
    summary: ["We collect what we need to run your account and keep it secure, and nothing for advertising.", "We name every provider we use, where it is, and whether it is in use yet.", "We do not sell personal data, and you can ask for a copy or for deletion."],
    Body: Privacy,
  },
  {
    slug: "refund",
    title: "Refund Policy",
    description: "How cancellations and refunds work for monthly and yearly packages.",
    updated: "2026-11-13",
    summary: ["Consumers can cancel a new package within 14 days.", "Monthly packages can be cancelled at any time and run to the end of the paid month.", "Yearly packages have a full refund window after first purchase, then a pro-rata refund."],
    Body: Refund,
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description: "What you may and may not host on Zaffre.",
    updated: "2026-11-13",
    summary: ["Host lawful websites and apps. Do not host malware, spam or attacks on others.", "Stay within your plan's fair limits. If you outgrow them, we talk to you first.", "If we have to act on a problem, we tell you what we did and why."],
    Body: AcceptableUse,
  },
  {
    slug: "sla",
    title: "Service Levels",
    description: "What we commit to on monitoring, support and maintenance.",
    updated: "2026-11-13",
    summary: ["We monitor your sites from outside our own network and a person investigates alerts.", "We answer support every day, within 24 hours.", "We do not publish an uptime percentage until we have real measurements to back it."],
    Body: Sla,
  },
  {
    slug: "dpa",
    title: "Data Processing Agreement",
    description: "How we handle personal data in the websites you host with us, under Article 28 GDPR.",
    updated: "2026-11-13",
    summary: ["You control the personal data in your websites; we process it only on your instructions.", "We tell you about a breach within 48 hours and give 30 days' notice of new sub-processors.", "When you leave, you get a copy and we delete the rest."],
    Body: Dpa,
  },
  {
    slug: "subprocessors",
    title: "Sub-processors",
    description: "The outside providers that may process the content of websites you host with us.",
    updated: "2026-11-13",
    summary: ["Each provider, what it does, where it is, and whether it is in use yet.", "We email you 30 days before adding or replacing one."],
    Body: Subprocessors,
  },
  {
    slug: "cancellation",
    title: "Cancellation Form",
    description: "How consumers can cancel a new package within 14 days, with a model form.",
    updated: "2026-11-13",
    summary: ["Consumers in the UK and EU can cancel a new package within 14 days.", "Any clear message works; this form is optional.", "We refund within 14 days."],
    Body: Cancellation,
  },
  {
    slug: "complaints",
    title: "Complaints",
    description: "How to complain and what we do about it.",
    updated: "2026-11-13",
    summary: ["Email us with \"Complaint\" in the subject.", "We acknowledge within 2 business days and reply in full within 14 days.", "You can ask for a review if you are not satisfied."],
    Body: Complaints,
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((d) => d.slug === slug);
}
