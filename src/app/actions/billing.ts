"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, getInvoice, ForbiddenError } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { checkUpload, safeFileName } from "@/lib/uploads";
import { invoiceTotalCents, nextInvoiceStatus } from "@/lib/billing";
import { fieldErrors, type FormState } from "@/lib/forms";
import { getAdapters } from "@/lib/adapters";
import { site } from "@/config/site";

const proofSchema = z.object({
  invoiceId: z.string().min(1),
  methodId: z.string().min(1, "Choose how you paid."),
  reference: z.string().trim().min(3, "Enter the transfer reference from your bank or Wise.").max(80),
});

/**
 * Client submits proof of a manual payment. The file is validated by size, type and magic bytes.
 * Phase 1 keeps only metadata; Phase 2 stores the file in private object storage (R2) with signed URLs.
 */
export async function submitPaymentProof(_prev: FormState, formData: FormData): Promise<FormState> {
  let invoiceId = "";
  try {
    const viewer = await getViewer();
    assertCan(viewer, "billing:pay");
    const parsed = proofSchema.safeParse({ invoiceId: formData.get("invoiceId"), methodId: formData.get("methodId"), reference: formData.get("reference") });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const invoice = getInvoice(viewer, parsed.data.invoiceId);
    if (!invoice) return { ok: false, message: "Invoice not found." };
    const next = nextInvoiceStatus(invoice.status, "submit_proof");
    if (!next) return { ok: false, message: "This invoice can't take a new payment right now." };
    const method = db().paymentMethods.find((m) => m.id === parsed.data.methodId && m.enabled);
    if (!method) return { ok: false, errors: { methodId: "Choose how you paid." } };

    const file = formData.get("proof");
    if (!(file instanceof File) || file.size === 0) return { ok: false, errors: { proof: "Attach a screenshot or PDF of your payment." } };
    const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const check = checkUpload({ size: file.size, type: file.type, head });
    if (!check.ok) return { ok: false, errors: { proof: check.error } };

    db().payments.unshift({
      id: nextId("pay"),
      invoiceId: invoice.id,
      accountId: viewer.account.id,
      methodId: method.id,
      amountCents: invoiceTotalCents(invoice),
      reference: parsed.data.reference,
      proofFileName: safeFileName(file.name),
      proofMime: check.mime,
      proofSize: file.size,
      status: "pending_verification",
      submittedAt: new Date().toISOString(),
      submittedBy: viewer.user.id,
    });
    invoice.status = next;
    audit(viewer, "payment.submit", invoice.number);
    await getAdapters().email.send({ to: site.contact.supportEmail, subject: `Payment proof for ${invoice.number}`, body: `${viewer.account.name} submitted ${method.label} reference ${parsed.data.reference}.` });
    invoiceId = invoice.id;
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
  redirect(`/dashboard/billing/${invoiceId}?submitted=1`);
}
