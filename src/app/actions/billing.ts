"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { site } from "@/config/site";
import { getAdapters } from "@/lib/adapters";
import { getViewer } from "@/lib/auth/viewer";
import { invoiceTotalCents, nextInvoiceStatus } from "@/lib/billing";
import { assertCan, audit, ForbiddenError, getInvoice } from "@/lib/data/client";
import { getDb, schema as t } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { readUpload, storeFile } from "@/lib/files";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";

const proofSchema = z.object({
  invoiceId: z.string().min(1).max(64),
  methodId: z.string().min(1, "Choose how you paid.").max(64),
  reference: z.string().trim().min(3, "Enter the transfer reference from your bank or Wise.").max(80),
});

/**
 * Client submits proof of a manual payment. The file is checked by size, type and first
 * bytes, stored privately, and only shown to this account and to admins.
 */
export async function submitPaymentProof(_prev: FormState, formData: FormData): Promise<FormState> {
  let invoiceId = "";
  try {
    const viewer = await getViewer();
    assertCan(viewer, "billing:pay");
    const parsed = proofSchema.safeParse({ invoiceId: formData.get("invoiceId"), methodId: formData.get("methodId"), reference: formData.get("reference") });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    if (!(await rateLimit(`proof:${viewer.user.id}`, 10, 60 * 60_000)).ok) return { ok: false, message: "Too many uploads in the last hour. Please try again later." };
    const invoice = await getInvoice(viewer, parsed.data.invoiceId);
    if (!invoice) return { ok: false, message: "Invoice not found." };
    const next = nextInvoiceStatus(invoice.status, "submit_proof");
    if (!next) return { ok: false, message: "This invoice can't take a new payment right now." };
    const db = await getDb();
    const [method] = await db
      .select()
      .from(t.paymentMethods)
      .where(and(eq(t.paymentMethods.id, parsed.data.methodId), eq(t.paymentMethods.enabled, true)));
    if (!method) return { ok: false, errors: { methodId: "Choose how you paid." } };

    const upload = formData.get("proof");
    if (!(upload instanceof File) || upload.size === 0) return { ok: false, errors: { proof: "Attach a screenshot or PDF of your payment." } };
    const checked = await readUpload(upload);
    if (!checked.ok) return { ok: false, errors: { proof: checked.error } };

    const moved = await db.transaction(async (tx) => {
      // Only move the invoice if it is still in the state we checked, so two uploads can't both win.
      const updated = await tx
        .update(t.invoices)
        .set({ status: next })
        .where(and(eq(t.invoices.id, invoice.id), eq(t.invoices.accountId, viewer.account.id), eq(t.invoices.status, invoice.status)))
        .returning({ id: t.invoices.id });
      if (updated.length === 0) return false;
      const proofFileId = await storeFile(tx, { accountId: viewer.account.id, uploadedBy: viewer.user.id, file: checked.file });
      await tx.insert(t.payments).values({
        id: newId("pay"),
        invoiceId: invoice.id,
        accountId: viewer.account.id,
        methodId: method.id,
        amountCents: invoiceTotalCents(invoice),
        reference: parsed.data.reference,
        proofFileName: checked.file.name,
        proofMime: checked.file.mime,
        proofSize: checked.file.size,
        proofFileId,
        status: "pending_verification",
        submittedBy: viewer.user.id,
      });
      await audit(viewer, "payment.submit", invoice.number, tx);
      return true;
    });
    if (!moved) return { ok: false, message: "This invoice can't take a new payment right now." };

    await getAdapters().email.send({ to: site.contact.supportEmail, subject: `Payment proof for ${invoice.number}`, body: `${viewer.account.name} submitted ${method.label} reference ${parsed.data.reference}.` });
    invoiceId = invoice.id;
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
  redirect(`/dashboard/billing/${invoiceId}?submitted=1`);
}
