import { describe, expect, it } from "vitest";
import { invoiceTotalCents, isOverdue, nextInvoiceStatus } from "@/lib/billing";

describe("invoice totals", () => {
  it("adds quantity × unit price", () => {
    expect(invoiceTotalCents({ lines: [{ description: "a", quantity: 2, unitCents: 1250 }, { description: "b", quantity: 1, unitCents: 500 }] })).toBe(3000);
  });
  it("is zero with no lines", () => {
    expect(invoiceTotalCents({ lines: [] })).toBe(0);
  });
});

describe("invoice status machine", () => {
  it("follows unpaid → pending verification → paid", () => {
    expect(nextInvoiceStatus("unpaid", "submit_proof")).toBe("pending_verification");
    expect(nextInvoiceStatus("pending_verification", "approve")).toBe("paid");
  });
  it("returns to unpaid when a proof is rejected", () => {
    expect(nextInvoiceStatus("pending_verification", "reject")).toBe("unpaid");
  });
  it("never moves a paid or void invoice", () => {
    for (const event of ["submit_proof", "approve", "reject", "void", "mark_paid"] as const) {
      expect(nextInvoiceStatus("paid", event)).toBeNull();
      expect(nextInvoiceStatus("void", event)).toBeNull();
    }
  });
  it("can't void an invoice that is waiting for verification", () => {
    expect(nextInvoiceStatus("pending_verification", "void")).toBeNull();
  });
});

describe("overdue", () => {
  const now = Date.parse("2026-11-11T12:00:00Z");
  it("is overdue only when unpaid and past due", () => {
    expect(isOverdue({ status: "unpaid", dueAt: "2026-11-10T00:00:00Z" }, now)).toBe(true);
    expect(isOverdue({ status: "unpaid", dueAt: "2026-11-12T00:00:00Z" }, now)).toBe(false);
    expect(isOverdue({ status: "pending_verification", dueAt: "2026-11-10T00:00:00Z" }, now)).toBe(false);
    expect(isOverdue({ status: "paid", dueAt: "2026-11-10T00:00:00Z" }, now)).toBe(false);
  });
});
