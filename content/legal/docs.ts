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
  Body: ComponentType;
}

export const legalDocs: LegalDoc[] = [
  { slug: "terms", title: "Terms of Service", description: "The agreement between you and Zaffre for our hosting services.", Body: Terms },
  { slug: "privacy", title: "Privacy Policy", description: "What personal data we collect, where it is stored, and your rights.", Body: Privacy },
  { slug: "refund", title: "Refund Policy", description: "How cancellations and refunds work for monthly and yearly packages.", Body: Refund },
  { slug: "acceptable-use", title: "Acceptable Use Policy", description: "What you may and may not host on Zaffre.", Body: AcceptableUse },
  { slug: "sla", title: "Service Levels", description: "What we commit to on monitoring, support and maintenance.", Body: Sla },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((d) => d.slug === slug);
}
