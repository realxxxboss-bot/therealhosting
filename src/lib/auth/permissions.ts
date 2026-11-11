import type { Membership, Role } from "@/lib/data/types";

export type Capability =
  | "sites:view"
  | "sites:manage"
  | "billing:view"
  | "billing:pay"
  | "team:manage"
  | "support:use"
  | "email:manage"
  | "domains:manage";

const roleCapabilities: Record<Role, Capability[]> = {
  owner: ["sites:view", "sites:manage", "billing:view", "billing:pay", "team:manage", "support:use", "email:manage", "domains:manage"],
  developer: ["sites:view", "sites:manage", "support:use", "domains:manage"],
  billing: ["billing:view", "billing:pay", "support:use"],
};

export const roleLabels: Record<Role, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Everything, including billing and team access." },
  developer: { label: "Developer", description: "Deploys, domains, environment variables and logs for the sites you choose. No billing." },
  billing: { label: "Billing only", description: "Invoices and payments. No access to sites." },
};

export function can(membership: Pick<Membership, "role">, capability: Capability): boolean {
  return roleCapabilities[membership.role].includes(capability);
}

/** Whether a membership may see a given site. Billing-only members see no sites. */
export function canAccessSite(membership: Pick<Membership, "role" | "siteIds">, siteId: string): boolean {
  if (!can(membership, "sites:view")) return false;
  return membership.siteIds === null || membership.siteIds.includes(siteId);
}
