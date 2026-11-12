import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { site } from "@/config/site";
import { invoiceTotalCents } from "@/lib/billing";
import type { Account, Invoice } from "@/lib/data/types";
import { formatCents } from "@/lib/utils";

const ink = rgb(0.06, 0.07, 0.1);
const muted = rgb(0.38, 0.41, 0.47);
const rule = rgb(0.86, 0.87, 0.9);
const zaffre = rgb(0, 20 / 255, 168 / 255);

const statusLabel: Record<Invoice["status"], string> = { unpaid: "Unpaid", pending_verification: "Payment being checked", paid: "Paid", void: "Void" };

/** The standard PDF fonts cover Latin-1 only; anything else becomes "?" instead of failing the download. */
function safe(text: string): string {
  return text.replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of safe(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function day(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** A4 invoice with the same facts as the on-screen invoice. Amounts are US dollars. */
export async function renderInvoicePdf(invoice: Invoice, account: Pick<Account, "name" | "billingEmail" | "country">): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${invoice.number}`);
  pdf.setAuthor(site.name);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 595.28;
  const height = 841.89;
  const left = 56;
  const right = width - 56;
  let page: PDFPage = pdf.addPage([width, height]);
  let y = height - 64;

  const text = (value: string, x: number, size: number, font = regular, color = ink) => page.drawText(safe(value), { x, y, size, font, color });
  const textRight = (value: string, size: number, font = regular, color = ink) => page.drawText(safe(value), { x: right - font.widthOfTextAtSize(safe(value), size), y, size, font, color });
  const line = (color = rule, thickness = 0.75) => page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness, color });

  text(site.name, left, 22, bold, zaffre);
  textRight("Invoice", 22, bold);
  y -= 18;
  text(site.domain, left, 10, regular, muted);
  textRight(invoice.number, 11, regular, muted);
  y -= 34;
  line(ink, 1);
  y -= 26;

  const meta: [string, string][] = [
    ["Billed to", account.name],
    ["Email", account.billingEmail],
    ...(account.country ? ([["Country", account.country]] as [string, string][]) : []),
    ["Issued", day(invoice.issuedAt)],
    ["Due", day(invoice.dueAt)],
    ["Status", statusLabel[invoice.status]],
  ];
  for (const [label, value] of meta) {
    text(label, left, 10, regular, muted);
    text(value, left + 90, 10.5);
    y -= 17;
  }
  y -= 20;

  text("Description", left, 9.5, regular, muted);
  textRight("Amount", 9.5, regular, muted);
  y -= 9;
  line(ink, 1);
  y -= 20;
  for (const item of invoice.lines) {
    const rows = wrap(item.description, regular, 10.5, right - left - 120);
    if (y - rows.length * 15 < 120) {
      page = pdf.addPage([width, height]);
      y = height - 64;
    }
    const amount = formatCents(item.quantity * item.unitCents);
    rows.forEach((row, i) => {
      text(row, left, 10.5);
      if (i === 0) textRight(amount, 10.5);
      y -= 15;
    });
    y -= 5;
    line();
    y -= 18;
  }

  y -= 4;
  text("Total (USD)", right - 220, 12, bold);
  textRight(formatCents(invoiceTotalCents(invoice)), 12, bold);
  y -= 34;

  if (invoice.notes) {
    text("Notes", left, 9.5, regular, muted);
    y -= 15;
    for (const row of wrap(invoice.notes, regular, 10, right - left)) {
      text(row, left, 10);
      y -= 14;
    }
    y -= 12;
  }

  y = 72;
  line();
  y -= 16;
  text(`All amounts are in US dollars. Questions about this invoice: ${site.contact.supportEmail}`, left, 9, regular, muted);
  return pdf.save();
}

export function pdfResponse(bytes: Uint8Array, fileName: string): Response {
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
