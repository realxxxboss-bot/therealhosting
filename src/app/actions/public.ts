"use server";

import { z } from "zod";
import { getAdapters, providerMessage } from "@/lib/adapters";
import type { DomainAvailability } from "@/lib/adapters/types";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { site } from "@/config/site";

export type DomainSearchState = { query: string; results: DomainAvailability[]; error?: string };

const domainQuery = z
  .string()
  .trim()
  .min(2, "Type at least 2 characters.")
  .max(63, "That name is too long.")
  .regex(/^[a-zA-Z0-9.-]+$/, "Use letters, numbers, dots and hyphens only.");

export async function searchDomains(_prev: DomainSearchState, formData: FormData): Promise<DomainSearchState> {
  const raw = String(formData.get("q") ?? "");
  const parsed = domainQuery.safeParse(raw);
  if (!parsed.success) return { query: raw, results: [], error: parsed.error.issues[0]?.message };
  const limit = await rateLimit(`domain:${await clientIp()}`, 30, 60_000);
  if (!limit.ok) return { query: raw, results: [], error: `Too many searches. Try again in ${limit.retryAfterSec} seconds.` };
  try {
    const results = await getAdapters().registrar.search(parsed.data);
    return { query: raw, results };
  } catch (e) {
    const message = providerMessage(e);
    if (message) return { query: raw, results: [], error: "Domain search is not available right now. Contact us and we'll check a name for you." };
    throw e;
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address."),
  company: z.string().trim().max(120).optional(),
  topic: z.enum(["sales", "migration", "support", "billing", "other"]),
  sites: z.string().trim().max(500).optional(),
  message: z.string().trim().min(10, "Please tell us a little more (10+ characters).").max(4000),
  // Honeypot: real people leave this empty.
  website: z.string().max(0).optional(),
});

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please check the highlighted fields." };
  const limit = await rateLimit(`contact:${await clientIp()}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "You've sent several messages already. Please try again in a few minutes." };
  const { name, email, company, topic, sites, message } = parsed.data;
  await getAdapters().email.send({
    to: site.contact.salesEmail,
    subject: `[${topic}] New enquiry from ${name}`,
    body: [`From: ${name} <${email}>`, company ? `Company: ${company}` : "", sites ? `Sites: ${sites}` : "", "", message].filter(Boolean).join("\n"),
  });
  return { ok: true, message: "We have your message and will reply by email, usually within one business day." };
}
