import type { BadgeTone } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge";
import type { DeployStatus, DomainStatus, InvoiceStatus, SiteStatus, SslStatus, TicketStatus } from "@/lib/data/types";
import { invoiceStatusLabel } from "@/lib/billing";

const siteMap: Record<SiteStatus, [BadgeTone, string]> = {
  up: ["success", "Up"],
  degraded: ["warning", "Slow"],
  down: ["danger", "Down"],
  deploying: ["primary", "Deploying"],
  paused: ["neutral", "Paused"],
};
export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const [tone, label] = siteMap[status];
  return <StatusBadge tone={tone} label={label} pulse={status === "down" || status === "deploying"} />;
}

const invoiceTone: Record<InvoiceStatus, BadgeTone> = { unpaid: "warning", pending_verification: "primary", paid: "success", void: "neutral" };
export function InvoiceStatusBadge({ status, overdue = false }: { status: InvoiceStatus; overdue?: boolean }) {
  if (overdue) return <StatusBadge tone="danger" label="Overdue" />;
  return <StatusBadge tone={invoiceTone[status]} label={invoiceStatusLabel[status]} />;
}

const domainMap: Record<DomainStatus, [BadgeTone, string]> = {
  pending_dns: ["warning", "Waiting for DNS"],
  verifying: ["primary", "Verifying"],
  active: ["success", "Connected"],
  error: ["danger", "Error"],
};
export function DomainStatusBadge({ status }: { status: DomainStatus }) {
  const [tone, label] = domainMap[status];
  return <StatusBadge tone={tone} label={label} />;
}

const sslMap: Record<SslStatus, [BadgeTone, string]> = { pending: ["warning", "SSL pending"], active: ["success", "SSL active"], error: ["danger", "SSL error"] };
export function SslBadge({ status }: { status: SslStatus }) {
  const [tone, label] = sslMap[status];
  return <StatusBadge tone={tone} label={label} />;
}

const deployMap: Record<DeployStatus, [BadgeTone, string]> = {
  queued: ["neutral", "Queued"],
  building: ["primary", "Building"],
  ready: ["success", "Ready"],
  failed: ["danger", "Failed"],
  cancelled: ["neutral", "Cancelled"],
};
export function DeployStatusBadge({ status }: { status: DeployStatus }) {
  const [tone, label] = deployMap[status];
  return <StatusBadge tone={tone} label={label} pulse={status === "building"} />;
}

const ticketMap: Record<TicketStatus, [BadgeTone, string]> = { open: ["primary", "Open"], awaiting_client: ["warning", "Waiting for you"], closed: ["neutral", "Closed"] };
export function TicketStatusBadge({ status, staffView = false }: { status: TicketStatus; staffView?: boolean }) {
  const [tone, label] = ticketMap[status];
  return <StatusBadge tone={tone} label={staffView && status === "awaiting_client" ? "Waiting for client" : staffView && status === "open" ? "Needs reply" : label} />;
}
