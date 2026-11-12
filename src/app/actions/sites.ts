"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, getSiteOrThrow, ForbiddenError } from "@/lib/data/client";
import { and, eq, ne } from "drizzle-orm";
import { site as siteConfig } from "@/config/site";
import { encrypt } from "@/lib/auth/secrets";
import { getDb, schema as t } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { getAdapters, providerMessage } from "@/lib/adapters";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";

async function siteContext(formData: FormData) {
  const viewer = await getViewer();
  assertCan(viewer, "sites:manage");
  const site = await getSiteOrThrow(viewer, String(formData.get("siteId") ?? ""));
  return { viewer, site };
}

function failure(error: unknown): FormState {
  if (error instanceof ForbiddenError) return { ok: false, message: error.message };
  const message = providerMessage(error);
  if (message) return { ok: false, message };
  throw error;
}

export async function redeploySite(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    if (!(await rateLimit(`deploy:${site.id}`, 5, 60_000)).ok) return { ok: false, message: "Please wait a minute before deploying again." };
    const { deploymentId } = await getAdapters().deploy.redeploy(site);
    const db = await getDb();
    await db
      .insert(t.deployments)
      .values({ id: deploymentId, siteId: site.id, status: "building", commit: "HEAD", message: "Manual redeploy from dashboard", branch: site.branch ?? "main", author: viewer.user.name, durationSec: 0 })
      .onConflictDoNothing();
    await audit(viewer, "site.redeploy", site.name);
    refresh();
    return { ok: true, message: "Redeploy started. It usually takes about a minute." };
  } catch (e) {
    return failure(e);
  }
}

export async function restartSite(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    if (!(await rateLimit(`restart:${site.id}`, 5, 60_000)).ok) return { ok: false, message: "Please wait a minute before restarting again." };
    await getAdapters().deploy.restart(site);
    await audit(viewer, "site.restart", site.name);
    return { ok: true, message: "Restarted. Your site may be slow for a few seconds." };
  } catch (e) {
    return failure(e);
  }
}

const hostnameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, "Enter a domain like example.com or www.example.com.");

export async function addDomain(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    assertCan(viewer, "domains:manage");
    const parsed = hostnameSchema.safeParse(formData.get("hostname"));
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const hostname = parsed.data;
    if (!(await rateLimit(`domain-add:${viewer.account.id}`, 30, 60 * 60_000)).ok) return { ok: false, message: "Too many domains added in the last hour. Please try again later." };
    const db = await getDb();
    // The unique index on hostname is the real guard; this insert either wins or does nothing.
    const inserted = await db
      .insert(t.domains)
      .values({ id: newId("dom"), accountId: viewer.account.id, siteId: site.id, hostname, status: "pending_dns", ssl: "pending" })
      .onConflictDoNothing()
      .returning({ id: t.domains.id });
    const domainId = inserted[0]?.id;
    if (!domainId) return { ok: false, errors: { form: "That domain is already connected to a site." } };
    try {
      const { id: providerRef } = await getAdapters().hostnames.create(hostname);
      await db.update(t.domains).set({ providerRef }).where(eq(t.domains.id, domainId));
    } catch (e) {
      // The edge never accepted it, so don't keep a domain the client can't finish setting up.
      await db.delete(t.domains).where(eq(t.domains.id, domainId));
      throw e;
    }
    await audit(viewer, "domain.add", `${hostname} → ${site.name}`);
    refresh();
    return { ok: true, message: `${hostname} added. Add the DNS records below, then press Check now.` };
  } catch (e) {
    return failure(e);
  }
}

export async function checkDomain(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "domains:manage");
    const db = await getDb();
    const [domain] = await db
      .select()
      .from(t.domains)
      .where(and(eq(t.domains.id, String(formData.get("domainId") ?? "")), eq(t.domains.accountId, viewer.account.id)));
    if (!domain) return { ok: false, message: "Domain not found." };
    if (domain.siteId) await getSiteOrThrow(viewer, domain.siteId);
    if (!(await rateLimit(`domain-check:${domain.id}`, 12, 60_000)).ok) return { ok: false, message: "Please wait a moment before checking again." };
    const result = await getAdapters().hostnames.check(domain.hostname);
    await db
      .update(t.domains)
      .set({ status: result.dnsOk ? "active" : "pending_dns", ssl: result.ssl })
      .where(eq(t.domains.id, domain.id));
    refresh();
    return { ok: result.dnsOk, message: result.message };
  } catch (e) {
    return failure(e);
  }
}

export async function setRedirect(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const db = await getDb();
    const siteDomains = await db.select().from(t.domains).where(eq(t.domains.siteId, site.id));
    const domain = siteDomains.find((d) => d.id === formData.get("domainId"));
    if (!domain) return { ok: false, message: "Domain not found." };
    const target = String(formData.get("redirectTo") ?? "");
    if (target && !siteDomains.some((d) => d.id !== domain.id && d.hostname === target)) return { ok: false, message: "Pick one of this site's domains." };
    await db.update(t.domains).set({ redirectTo: target || null }).where(eq(t.domains.id, domain.id));
    await audit(viewer, "domain.redirect", `${domain.hostname} → ${target || "none"}`);
    refresh();
    return { ok: true, message: target ? `${domain.hostname} now redirects to ${target}.` : "Redirect removed." };
  } catch (e) {
    return failure(e);
  }
}

export async function removeDomain(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const db = await getDb();
    const [domain] = await db
      .select()
      .from(t.domains)
      .where(and(eq(t.domains.id, String(formData.get("domainId") ?? "")), eq(t.domains.siteId, site.id)));
    if (!domain) return { ok: false, message: "Domain not found." };
    if (domain.hostname === site.primaryDomain) return { ok: false, message: "This is the primary domain. Set another primary domain first." };
    if (domain.providerRef) await getAdapters().hostnames.remove(domain.hostname);
    await db.delete(t.domains).where(and(eq(t.domains.id, domain.id), ne(t.domains.hostname, site.primaryDomain)));
    await audit(viewer, "domain.remove", domain.hostname);
    refresh();
    return { ok: true, message: "Domain removed." };
  } catch (e) {
    return failure(e);
  }
}

const envKey = z
  .string()
  .trim()
  .regex(/^[A-Z_][A-Z0-9_]{0,63}$/, "Use capital letters, numbers and underscores, e.g. API_KEY.");

export async function upsertEnvVar(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    if (site.type !== "nextjs") return { ok: false, message: "Environment variables are for Next.js sites." };
    const parsed = z
      .object({ key: envKey, value: z.string().min(1, "Enter a value.").max(4096), target: z.enum(["production", "preview", "all"]) })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const { key, value, target } = parsed.data;
    // The server gets the value first, so a failure there leaves nothing half-saved.
    await getAdapters().deploy.setEnv(site, [{ key, value }]);
    const db = await getDb();
    const now = new Date().toISOString();
    // Values are encrypted before they are stored. One row per key and site.
    const sealed = encrypt(value);
    const [existing] = await db
      .select({ id: t.envVars.id })
      .from(t.envVars)
      .where(and(eq(t.envVars.siteId, site.id), eq(t.envVars.key, key)));
    if (existing) await db.update(t.envVars).set({ value: sealed, target, updatedAt: now }).where(eq(t.envVars.id, existing.id));
    else await db.insert(t.envVars).values({ id: newId("env"), siteId: site.id, key, value: sealed, target, updatedAt: now });
    await audit(viewer, "env.update", `${site.name}: ${key}`);
    refresh();
    return { ok: true, message: `${key} saved. Redeploy to apply it.` };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteEnvVar(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const db = await getDb();
    const where = and(eq(t.envVars.id, String(formData.get("envId") ?? "")), eq(t.envVars.siteId, site.id));
    const [found] = await db.select({ key: t.envVars.key }).from(t.envVars).where(where);
    if (!found) return { ok: false, message: "Variable not found." };
    await getAdapters().deploy.deleteEnv(site, found.key);
    const [env] = await db.delete(t.envVars).where(where).returning({ key: t.envVars.key });
    if (!env) return { ok: false, message: "Variable not found." };
    await audit(viewer, "env.delete", `${site.name}: ${env.key}`);
    refresh();
    return { ok: true, message: `${env.key} deleted.` };
  } catch (e) {
    return failure(e);
  }
}

export async function requestRestore(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const db = await getDb();
    const [backup] = await db
      .select()
      .from(t.backups)
      .where(and(eq(t.backups.id, String(formData.get("backupId") ?? "")), eq(t.backups.siteId, site.id)));
    if (!backup) return { ok: false, message: "Backup not found." };
    if (!(await rateLimit(`restore:${site.id}`, 5, 60 * 60_000)).ok) return { ok: false, message: "Several restores were already requested for this site. Our team will be in touch." };
    const note = String(formData.get("note") ?? "").slice(0, 500);
    await db.insert(t.restoreRequests).values({ id: newId("rrq"), siteId: site.id, backupId: backup.id, requestedBy: viewer.user.name, note, status: "requested" });
    await audit(viewer, "backup.restore_request", `${site.name} from ${backup.createdAt.slice(0, 10)}`);
    await getAdapters().email.send({ to: siteConfig.contact.supportEmail, subject: `Restore request: ${site.name}`, body: `${viewer.user.name} asked to restore ${site.primaryDomain} from backup ${backup.id}. Note: ${note || "—"}` });
    refresh();
    return { ok: true, message: "Restore requested. Our team will confirm the time with you before restoring." };
  } catch (e) {
    return failure(e);
  }
}

export async function updateSiteSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const parsed = z
      .object({ name: z.string().trim().min(2, "Name is too short.").max(60), primaryDomain: z.string().trim().toLowerCase() })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const db = await getDb();
    const [owned] = await db
      .select({ id: t.domains.id })
      .from(t.domains)
      .where(and(eq(t.domains.siteId, site.id), eq(t.domains.hostname, parsed.data.primaryDomain)));
    if (!owned) return { ok: false, errors: { primaryDomain: "Pick one of this site's connected domains." } };
    await db
      .update(t.sites)
      .set({ name: parsed.data.name, primaryDomain: parsed.data.primaryDomain })
      .where(and(eq(t.sites.id, site.id), eq(t.sites.accountId, viewer.account.id)));
    await audit(viewer, "site.settings", parsed.data.name);
    refresh();
    return { ok: true, message: "Settings saved." };
  } catch (e) {
    return failure(e);
  }
}
