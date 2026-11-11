import type { Invoice, InvoiceStatus } from "@/lib/data/types";

export function invoiceTotalCents(invoice: Pick<Invoice, "lines">): number {
  return invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);
}

export type InvoiceEvent = "submit_proof" | "approve" | "reject" | "void" | "mark_paid";

const transitions: Record<InvoiceStatus, Partial<Record<InvoiceEvent, InvoiceStatus>>> = {
  unpaid: { submit_proof: "pending_verification", mark_paid: "paid", void: "void" },
  pending_verification: { approve: "paid", reject: "unpaid", mark_paid: "paid" },
  paid: {},
  void: {},
};

/** Invoice status machine: unpaid → pending verification → paid. Returns null for an invalid move. */
export function nextInvoiceStatus(current: InvoiceStatus, event: InvoiceEvent): InvoiceStatus | null {
  return transitions[current][event] ?? null;
}

export function isOverdue(invoice: Pick<Invoice, "status" | "dueAt">, now: number): boolean {
  return invoice.status === "unpaid" && new Date(invoice.dueAt).getTime() < now;
}

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  pending_verification: "Pending verification",
  paid: "Paid",
  void: "Void",
};
