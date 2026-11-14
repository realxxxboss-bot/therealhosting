import type { Metadata } from "next";
import { site } from "@/config/site";
import { Container, PageHero } from "@/components/marketing/section";
import { TextLink } from "@/components/marketing/blocks";

export const metadata: Metadata = {
  title: "Security",
  description: "How Zaffre protects your sites, your account and your data, and how to report a vulnerability.",
  alternates: { canonical: "/security" },
};

/** Only what the platform actually does today, or will do at launch where marked. */
const sections: { title: string; points: string[] }[] = [
  {
    title: "Your account",
    points: [
      "Passwords are hashed with scrypt and a unique salt. We can never see them.",
      "Two-factor authentication with any authenticator app. Each code works once.",
      "Two-factor is required for every Zaffre admin account.",
      "You can see the devices signed in to your account and sign any of them out.",
      "Password-reset and invite links are single-use, expire, and are stored only as hashes.",
      "Sign-in attempts are rate-limited, and failed attempts are logged.",
    ],
  },
  {
    title: "Access to your data",
    points: [
      "Team members get roles (owner, developer, billing) and can be limited to specific sites.",
      "Every dashboard query is scoped to your account, and this is covered by automated tests.",
      "If we sign in as you to help, a banner shows it and every action appears in your activity log.",
      "Admin actions are recorded in an audit log.",
    ],
  },
  {
    title: "Your sites",
    points: [
      "From launch, sites run on servers in Germany (EU), each in its own container with its own resource limits.",
      "Free SSL certificates and HTTPS for every domain, renewed automatically.",
      "Daily off-site backups, stored in the EU, kept for the number of days in your plan.",
      "We apply security updates to the hosting environment, and to WordPress where your plan includes it.",
      "Monitoring from outside our own network, with a person investigating every alert.",
    ],
  },
  {
    title: "This website and the dashboard",
    points: [
      "HTTPS everywhere, with HSTS.",
      "A Content Security Policy and other security headers that stop the dashboard being framed or loading foreign scripts.",
      "Uploaded files are checked by type and content, limited in size, and only served to signed-in users with access.",
      "Two-factor keys are encrypted at rest with AES-256-GCM.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero title="Security" body="What we do to keep your sites, your account and your data safe. Plain facts, no badges we haven't earned." />
      <Container className="py-14 sm:py-20">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={`sec-${section.title}`}>
              <h2 id={`sec-${section.title}`} className="text-h3 font-semibold">
                {section.title}
              </h2>
              <ul className="mt-6 border-t border-foreground">
                {section.points.map((point) => (
                  <li key={point} className="border-b border-border py-3.5 text-lg leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section aria-labelledby="report" className="mt-20 max-w-[62ch] border-t border-foreground pt-8">
          <h2 id="report" className="text-h3 font-semibold">
            Report a vulnerability
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            If you think you have found a security problem in Zaffre, email <TextLink href={`mailto:${site.contact.email}?subject=Security`}>{site.contact.email}</TextLink> with &quot;Security&quot; in the subject. Include steps to reproduce it. We reply within 2 business days, keep you updated, and credit you if you wish. Please don&apos;t access other people&apos;s data, disrupt the service or run automated scans against client sites.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            More detail: our <TextLink href="/legal/privacy">Privacy Policy</TextLink>, <TextLink href="/legal/dpa">Data Processing Agreement</TextLink> and <TextLink href="/legal/subprocessors">sub-processor list</TextLink>.
          </p>
        </section>
      </Container>
    </>
  );
}
