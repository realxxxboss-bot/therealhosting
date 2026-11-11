import { describe, expect, it } from "vitest";
import { can, canAccessSite } from "@/lib/auth/permissions";

describe("role capabilities", () => {
  it("gives owners everything", () => {
    expect(can({ role: "owner" }, "billing:pay")).toBe(true);
    expect(can({ role: "owner" }, "team:manage")).toBe(true);
  });
  it("keeps developers away from billing and team", () => {
    expect(can({ role: "developer" }, "sites:manage")).toBe(true);
    expect(can({ role: "developer" }, "billing:view")).toBe(false);
    expect(can({ role: "developer" }, "team:manage")).toBe(false);
  });
  it("keeps billing-only members away from sites", () => {
    expect(can({ role: "billing" }, "billing:pay")).toBe(true);
    expect(can({ role: "billing" }, "sites:view")).toBe(false);
  });
});

describe("site access", () => {
  it("limits developers to their chosen sites", () => {
    const m = { role: "developer" as const, siteIds: ["site_1"] };
    expect(canAccessSite(m, "site_1")).toBe(true);
    expect(canAccessSite(m, "site_2")).toBe(false);
  });
  it("lets null siteIds mean all sites", () => {
    expect(canAccessSite({ role: "owner", siteIds: null }, "anything")).toBe(true);
  });
  it("never lets billing-only members see a site", () => {
    expect(canAccessSite({ role: "billing", siteIds: null }, "site_1")).toBe(false);
  });
});
