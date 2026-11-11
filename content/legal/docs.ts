import type { ComponentType } from "react";
import Terms from "./terms.mdx";
import Privacy from "./privacy.mdx";
import Refund from "./refund.mdx";
import AcceptableUse from "./acceptable-use.mdx";
import Sla from "./sla.mdx";

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
    updated: "2026-11-11",
    summary: ["You pay a fixed price for a package and we host and manage the sites in it.", "Your content stays yours. You can leave at any time and take a copy with you.", "The price you sign up at does not rise at renewal."],
    Body: Terms,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What personal data we collect, where it is stored, and your rights.",
    updated: "2026-11-11",
    summary: ["We collect what we need to run your account and keep it secure, and nothing for advertising.", "We name the region where your data and backups are stored.", "We do not sell personal data, and you can ask for a copy or for deletion."],
    Body: Privacy,
  },
  {
    slug: "refund",
    title: "Refund Policy",
    description: "How cancellations and refunds work for monthly and yearly packages.",
    updated: "2026-11-11",
    summary: ["Monthly packages can be cancelled at any time and run to the end of the paid month.", "Yearly packages have a refund window after first purchase.", "Tell us if something went wrong. A person looks at every request."],
    Body: Refund,
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description: "What you may and may not host on Zaffre.",
    updated: "2026-11-11",
    summary: ["Host lawful websites and apps. Do not host malware, spam or attacks on others.", "Stay within your plan's fair limits. If you outgrow them, we talk to you first.", "If we have to act on a problem, we tell you what we did and why."],
    Body: AcceptableUse,
  },
  {
    slug: "sla",
    title: "Service Levels",
    description: "What we commit to on monitoring, support and maintenance.",
    updated: "2026-11-11",
    summary: ["We monitor your sites from outside our own network and a person investigates alerts.", "We do not publish an uptime percentage until we have real measurements to back it.", "Planned maintenance is announced in advance."],
    Body: Sla,
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((d) => d.slug === slug);
}
