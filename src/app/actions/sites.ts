"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, getSiteOrThrow, ForbiddenError } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { getAdapters } from "@/lib/adapters";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";

async function siteContext(formData: FormData) {
  const viewer = await getViewer();
  assertCan(viewer, "sites:manage");
  const site = getSiteOrThrow(viewer, String(formData.get("siteId") ?? ""));
  return { viewer, site };
}

function failure(error: unknown): FormState {
  if (error instanceof ForbiddenError) return { ok: false, message: error.message };
  throw error;
}

export async function redeploySite(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    if (!rateLimit(`deploy:${site.id}`, 5, 60_000).ok) return { ok: false, message: "Please wait a minute before deploying again." };
    const { deploymentId } = await getAdapters().deploy.redeploy(site.id);
    db().deployments.unshift({
      id: deploymentId,
      siteId: site.id,
      status: "building",
      commit: "HEAD",
      message: "Manual redeploy from dashboard",
      branch: site.branch ?? "main",
      author: viewer.user.name,
      createdAt: new Date().toISOString(),
      durationSec: 0,
    });
    audit(viewer, "site.redeploy", site.name);
    refresh();
    return { ok: true, message: "Redeploy started. It usually takes about a minute." };
  } catch (e) {
    return failure(e);
  }
}

export async function restartSite(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    await getAdapters().deploy.restart(site.id);
    audit(viewer, "site.restart", site.name);
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
    const store = db();
    if (store.domains.some((d) => d.hostname === hostname)) return { ok: false, errors: { form: "That domain is already connected to a site." } };
    await getAdapters().hostnames.create(hostname);
    store.domains.push({ id: nextId("dom"), accountId: viewer.account.id, siteId: site.id, hostname, status: "pending_dns", ssl: "pending", createdAt: new Date().toISOString() });
    audit(viewer, "domain.add", `${hostname} → ${site.name}`);
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
    const domain = db().domains.find((d) => d.id === formData.get("domainId") && d.accountId === viewer.account.id);
    if (!domain) return { ok: false, message: "Domain not found." };
    if (domain.siteId) getSiteOrThrow(viewer, domain.siteId);
    const result = await getAdapters().hostnames.check(domain.hostname);
    domain.status = result.dnsOk ? "active" : "pending_dns";
    domain.ssl = result.ssl;
    refresh();
    return { ok: result.dnsOk, message: result.message };
  } catch (e) {
    return failure(e);
  }
}

export async function setRedirect(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const domain = db().domains.find((d) => d.id === formData.get("domainId") && d.siteId === site.id);
    if (!domain) return { ok: false, message: "Domain not found." };
    const target = String(formData.get("redirectTo") ?? "");
    const siteDomains = db().domains.filter((d) => d.siteId === site.id && d.id !== domain.id).map((d) => d.hostname);
    if (target && !siteDomains.includes(target)) return { ok: false, message: "Pick one of this site's domains." };
    domain.redirectTo = target || undefined;
    audit(viewer, "domain.redirect", `${domain.hostname} → ${target || "none"}`);
    refresh();
    return { ok: true, message: target ? `${domain.hostname} now redirects to ${target}.` : "Redirect removed." };
  } catch (e) {
    return failure(e);
  }
}

export async function removeDomain(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const store = db();
    const index = store.domains.findIndex((d) => d.id === formData.get("domainId") && d.siteId === site.id);
    const domain = store.domains[index];
    if (!domain) return { ok: false, message: "Domain not found." };
    if (domain.hostname === site.primaryDomain) return { ok: false, message: "This is the primary domain. Set another primary domain first." };
    store.domains.splice(index, 1);
    audit(viewer, "domain.remove", domain.hostname);
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
    const store = db();
    const existing = store.envVars.find((e) => e.siteId === site.id && e.key === key);
    if (existing) Object.assign(existing, { value, target, updatedAt: new Date().toISOString() });
    else store.envVars.push({ id: nextId("env"), siteId: site.id, key, value, target, updatedAt: new Date().toISOString() });
    await getAdapters().deploy.setEnv(site.id, [{ key, value }]);
    audit(viewer, "env.update", `${site.name}: ${key}`);
    refresh();
    return { ok: true, message: `${key} saved. Redeploy to apply it.` };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteEnvVar(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const store = db();
    const index = store.envVars.findIndex((e) => e.id === formData.get("envId") && e.siteId === site.id);
    const env = store.envVars[index];
    if (!env) return { ok: false, message: "Variable not found." };
    store.envVars.splice(index, 1);
    audit(viewer, "env.delete", `${site.name}: ${env.key}`);
    refresh();
    return { ok: true, message: `${env.key} deleted.` };
  } catch (e) {
    return failure(e);
  }
}

export async function requestRestore(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { viewer, site } = await siteContext(formData);
    const backup = db().backups.find((b) => b.id === formData.get("backupId") && b.siteId === site.id);
    if (!backup) return { ok: false, message: "Backup not found." };
    const note = String(formData.get("note") ?? "").slice(0, 500);
    db().restoreRequests.unshift({ id: nextId("rst"), siteId: site.id, backupId: backup.id, requestedBy: viewer.user.name, note, status: "requested", createdAt: new Date().toISOString() });
    audit(viewer, "backup.restore_request", `${site.name} from ${backup.createdAt.slice(0, 10)}`);
    await getAdapters().email.send({ to: "support@zaffrehost.com", subject: `Restore request: ${site.name}`, body: `${viewer.user.name} asked to restore ${site.primaryDomain} from backup ${backup.id}. Note: ${note || "—"}` });
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
    const domains = db().domains.filter((d) => d.siteId === site.id).map((d) => d.hostname);
    if (!domains.includes(parsed.data.primaryDomain)) return { ok: false, errors: { primaryDomain: "Pick one of this site's connected domains." } };
    site.name = parsed.data.name;
    site.primaryDomain = parsed.data.primaryDomain;
    audit(viewer, "site.settings", site.name);
    refresh();
    return { ok: true, message: "Settings saved." };
  } catch (e) {
    return failure(e);
  }
}
