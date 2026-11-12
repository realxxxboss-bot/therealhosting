import { schema as t } from "@/lib/db";
import type { Invite, User } from "./types";

/** Columns that are meaningfully null in the domain types (not just "missing"). */
const KEEP_NULL = new Set(["siteId", "siteIds"]);

/** Database rows use null for empty optional columns; the domain types use undefined. */
export function fromRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) out[key] = value === null && !KEEP_NULL.has(key) ? undefined : value;
  return out as T;
}

export function fromRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => fromRow<T>(row));
}

/** User columns that are safe to hand to the UI. Never includes the password hash or TOTP secret. */
export const userColumns = {
  id: t.users.id,
  name: t.users.name,
  email: t.users.email,
  isAdmin: t.users.isAdmin,
  twoFactorEnabled: t.users.twoFactorEnabled,
  createdAt: t.users.createdAt,
};

export const inviteColumns = {
  id: t.invites.id,
  accountId: t.invites.accountId,
  email: t.invites.email,
  role: t.invites.role,
  siteIds: t.invites.siteIds,
  invitedBy: t.invites.invitedBy,
  createdAt: t.invites.createdAt,
};

export type UserRow = User;
export type InviteRow = Invite;
