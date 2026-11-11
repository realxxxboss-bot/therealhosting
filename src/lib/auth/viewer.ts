import "server-only";
import { cache } from "react";
import { requireAdmin, requireViewer } from "./session";

/** Per-request cached session lookups, so layouts and pages share one read. */
export const getViewer = cache(requireViewer);
export const getAdmin = cache(requireAdmin);
