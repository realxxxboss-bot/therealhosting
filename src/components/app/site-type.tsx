import { siteTypes, type SiteType } from "@/config/plans";

export function siteTypeLabel(type: SiteType): string {
  return siteTypes[type].short;
}
