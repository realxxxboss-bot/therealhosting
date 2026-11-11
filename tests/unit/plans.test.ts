import { describe, expect, it } from "vitest";
import { effectiveMonthly, getPlan, plans, plansByType, priceFor, yearlySavingPercent } from "@/config/plans";

describe("plans", () => {
  it("has three tiers for each site type", () => {
    for (const type of ["nextjs", "wordpress", "static"] as const) expect(plansByType(type)).toHaveLength(3);
  });
  it("has unique ids and rising prices within a type", () => {
    expect(new Set(plans.map((p) => p.id)).size).toBe(plans.length);
    for (const type of ["nextjs", "wordpress", "static"] as const) {
      const prices = plansByType(type).map((p) => p.monthly);
      expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    }
  });
  it("charges 10 months for a year", () => {
    const plan = getPlan("nextjs-business")!;
    expect(priceFor(plan, "yearly")).toBe(plan.monthly * 10);
    expect(effectiveMonthly(plan, "yearly")).toBeCloseTo((plan.monthly * 10) / 12, 2);
    expect(yearlySavingPercent()).toBe(17);
  });
  it("returns undefined for an unknown plan", () => {
    expect(getPlan("nope")).toBeUndefined();
  });
});
