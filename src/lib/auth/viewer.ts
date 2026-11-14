import "server-only";
import { cache } from "react";
import { requireAdmin, requireAdminSession, requireViewer } from "./session";

/** Per-request cached session lookups, so layouts and pages share one read. */
export const getViewer = cache(requireViewer);
export const getAdmin = cache(requireAdmin);
/** Admin without the two-factor check. Only for the admin frame and /admin/account. */
export const getAdminSession = cache(requireAdminSession);
