import { getPlan, priceFor, type BillingCycle } from "@/config/plans";
import { site as siteConfig } from "@/config/site";
import type {
  Account,
  AdminNote,
  Announcement,
  AuditEvent,
  Backup,
  Deployment,
  Domain,
  EmailTemplate,
  EnvVar,
  Invite,
  Invoice,
  Mailbox,
  Membership,
  Notification,
  NotificationKind,
  NotificationPrefs,
  Payment,
  PaymentMethod,
  RestoreRequest,
  Server,
  SessionRecord,
  Site,
  Subscription,
  Ticket,
  User,
} from "./types";

export interface Db {
  users: User[];
  accounts: Account[];
  memberships: Membership[];
  invites: Invite[];
  servers: Server[];
  subscriptions: Subscription[];
  sites: Site[];
  domains: Domain[];
  envVars: EnvVar[];
  deployments: Deployment[];
  backups: Backup[];
  restoreRequests: RestoreRequest[];
  mailboxes: Mailbox[];
  invoices: Invoice[];
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  tickets: Ticket[];
  notifications: Notification[];
  notificationPrefs: NotificationPrefs[];
  auditLog: AuditEvent[];
  sessions: SessionRecord[];
  adminNotes: AdminNote[];
  announcement: Announcement;
  emailTemplates: EmailTemplate[];
  counters: { invoice: number; ticket: number; id: number };
}

/** Demo sign-in accounts shown on the sign-in page. Password for all: "demo". */
export const DEMO_PASSWORD = "demo";
export const demoLogins = [
  { email: "owner@ukclient.example", label: "UK client: owner", description: "Full access to the demo client account" },
  { email: "dev@ukclient.example", label: "UK client: developer", description: "Access to two sites, no billing" },
  { email: "billing@ukclient.example", label: "UK client: billing only", description: "Invoices and payments only" },
  { email: "admin@zaffrehost.com", label: "Zaffre admin", description: "The admin panel" },
] as const;

const allKinds: NotificationKind[] = ["site_down", "site_up", "invoice", "payment_confirmed", "ticket_reply", "deploy", "info"];

export function createSeed(now: number): Db {
  const day = 86_400_000;
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
  const ago = (days: number, hours = 0) => iso(-(days * day + hours * 3_600_000));
  const inDays = (days: number) => iso(days * day);

  const users: User[] = [
    { id: "usr_admin", name: "Zaffre Admin", email: "admin@zaffrehost.com", isAdmin: true, twoFactorEnabled: true, createdAt: ago(200) },
    { id: "usr_owner", name: "Demo Owner", email: "owner@ukclient.example", isAdmin: false, twoFactorEnabled: false, createdAt: ago(120) },
    { id: "usr_dev", name: "Demo Developer", email: "dev@ukclient.example", isAdmin: false, twoFactorEnabled: true, createdAt: ago(90) },
    { id: "usr_billing", name: "Demo Accounts", email: "billing@ukclient.example", isAdmin: false, twoFactorEnabled: false, createdAt: ago(60) },
    { id: "usr_agency", name: "Agency Owner", email: "owner@agency.example", isAdmin: false, twoFactorEnabled: false, createdAt: ago(45) },
  ];

  const accounts: Account[] = [
    { id: "acc_uk", name: "UK client", billingEmail: "billing@ukclient.example", country: "United Kingdom", createdAt: ago(120), status: "active" },
    { id: "acc_agency", name: "Demo Agency", billingEmail: "owner@agency.example", createdAt: ago(45), status: "active" },
  ];

  const memberships: Membership[] = [
    { id: "mem_1", accountId: "acc_uk", userId: "usr_owner", role: "owner", siteIds: null, createdAt: ago(120) },
    { id: "mem_2", accountId: "acc_uk", userId: "usr_dev", role: "developer", siteIds: ["site_1", "site_2"], createdAt: ago(90) },
    { id: "mem_3", accountId: "acc_uk", userId: "usr_billing", role: "billing", siteIds: null, createdAt: ago(60) },
    { id: "mem_4", accountId: "acc_agency", userId: "usr_agency", role: "owner", siteIds: null, createdAt: ago(45) },
  ];

  const invites: Invite[] = [
    { id: "inv_1", accountId: "acc_uk", email: "freelancer@studio.example", role: "developer", siteIds: ["site_3"], invitedBy: "usr_owner", createdAt: ago(2) },
  ];

  const region = siteConfig.dataRegions[0] ?? "EU";
  const servers: Server[] = [
    { id: "srv_1", name: "vps-eu-1", region, provider: "vps", ip: "203.0.113.10", vcpu: 16, ramGb: 64, diskGb: 360, status: "healthy", cpuPct: 31, ramPct: 54, diskPct: 38 },
    { id: "srv_2", name: "vps-eu-2", region, provider: "vps", ip: "203.0.113.11", vcpu: 8, ramGb: 32, diskGb: 240, status: "warning", cpuPct: 72, ramPct: 81, diskPct: 44 },
  ];

  const sub = (id: string, accountId: string, planId: string, cycle: BillingCycle, startedDaysAgo: number, renewsInDays: number): Subscription => {
    const plan = getPlan(planId);
    if (!plan) throw new Error(`Unknown plan ${planId}`);
    return { id, accountId, planId, cycle, priceCents: priceFor(plan, cycle) * 100, startedAt: ago(startedDaysAgo), renewsAt: inDays(renewsInDays), status: "active" };
  };

  const subscriptions: Subscription[] = [
    sub("sub_1", "acc_uk", "nextjs-business", "monthly", 118, 4),
    sub("sub_2", "acc_uk", "wordpress-starter", "monthly", 118, 4),
    sub("sub_3", "acc_uk", "static-starter", "monthly", 118, 4),
    sub("sub_4", "acc_agency", "static-business", "yearly", 45, 320),
    sub("sub_5", "acc_agency", "wordpress-business", "monthly", 45, 15),
  ];

  const s = (
    id: string,
    accountId: string,
    subscriptionId: string,
    name: string,
    type: Site["type"],
    primaryDomain: string,
    extra: Partial<Site> = {},
  ): Site => ({
    id,
    accountId,
    subscriptionId,
    serverId: "srv_1",
    name,
    type,
    primaryDomain,
    status: "up",
    framework: type === "nextjs" ? "Next.js 16" : type === "wordpress" ? "WordPress 6.9" : "Static HTML",
    createdAt: ago(110),
    lastDeployAt: ago(1, 3),
    uptime30d: 99.98,
    responseMs: 180,
    ...extra,
  });

  const sites: Site[] = [
    s("site_1", "acc_uk", "sub_1", "Company website", "nextjs", "ukclient.example", { repo: "ukclient/website", branch: "main", responseMs: 142, uptime30d: 100 }),
    s("site_2", "acc_uk", "sub_1", "Online shop", "nextjs", "shop.ukclient.example", { repo: "ukclient/shop", branch: "main", responseMs: 211, lastDeployAt: ago(0, 5) }),
    s("site_3", "acc_uk", "sub_1", "Booking app", "nextjs", "book.ukclient.example", { repo: "ukclient/booking", branch: "production", responseMs: 188, serverId: "srv_2" }),
    s("site_4", "acc_uk", "sub_1", "Client portal", "nextjs", "portal.ukclient.example", { repo: "ukclient/portal", branch: "main", status: "degraded", responseMs: 640, uptime30d: 99.71, serverId: "srv_2" }),
    s("site_5", "acc_uk", "sub_2", "Blog", "wordpress", "blog.ukclient.example", { responseMs: 265, uptime30d: 99.86, lastDeployAt: ago(6) }),
    s("site_6", "acc_uk", "sub_3", "Spring offer page", "static", "offer.ukclient.example", { responseMs: 38, lastDeployAt: ago(12) }),
    s("site_7", "acc_agency", "sub_4", "Agency site", "static", "agency.example", { responseMs: 41 }),
    s("site_8", "acc_agency", "sub_5", "Client WordPress", "wordpress", "client-one.example", { responseMs: 230 }),
  ];

  const domains: Domain[] = [
    { id: "dom_1", accountId: "acc_uk", siteId: "site_1", hostname: "ukclient.example", status: "active", ssl: "active", registrar: "Client's registrar", expiresAt: inDays(210), createdAt: ago(110) },
    { id: "dom_2", accountId: "acc_uk", siteId: "site_1", hostname: "www.ukclient.example", status: "active", ssl: "active", redirectTo: "ukclient.example", createdAt: ago(110) },
    { id: "dom_3", accountId: "acc_uk", siteId: "site_2", hostname: "shop.ukclient.example", status: "active", ssl: "active", createdAt: ago(100) },
    { id: "dom_4", accountId: "acc_uk", siteId: "site_3", hostname: "book.ukclient.example", status: "active", ssl: "active", createdAt: ago(100) },
    { id: "dom_5", accountId: "acc_uk", siteId: "site_4", hostname: "portal.ukclient.example", status: "active", ssl: "active", createdAt: ago(95) },
    { id: "dom_6", accountId: "acc_uk", siteId: "site_5", hostname: "blog.ukclient.example", status: "active", ssl: "active", createdAt: ago(95) },
    { id: "dom_7", accountId: "acc_uk", siteId: "site_6", hostname: "offer.ukclient.example", status: "active", ssl: "active", createdAt: ago(30) },
    { id: "dom_8", accountId: "acc_uk", siteId: "site_2", hostname: "new-shop.ukclient.example", status: "pending_dns", ssl: "pending", createdAt: ago(0, 2) },
    { id: "dom_9", accountId: "acc_uk", siteId: null, hostname: "ukclient-events.example", status: "pending_dns", ssl: "pending", registrar: "Client's registrar", expiresAt: inDays(40), createdAt: ago(5) },
    { id: "dom_10", accountId: "acc_agency", siteId: "site_7", hostname: "agency.example", status: "active", ssl: "active", createdAt: ago(44) },
  ];

  const envVars: EnvVar[] = [
    { id: "env_1", siteId: "site_1", key: "NEXT_PUBLIC_SITE_URL", value: "https://ukclient.example", target: "all", updatedAt: ago(30) },
    { id: "env_2", siteId: "site_1", key: "CMS_API_TOKEN", value: "demo_cms_token_value", target: "production", updatedAt: ago(30) },
    { id: "env_3", siteId: "site_2", key: "DATABASE_URL", value: "postgres://demo:demo@db.internal:5432/shop", target: "production", updatedAt: ago(12) },
    { id: "env_4", siteId: "site_2", key: "PAYMENT_WEBHOOK_SECRET", value: "demo_webhook_secret", target: "production", updatedAt: ago(12) },
    { id: "env_5", siteId: "site_2", key: "NEXT_PUBLIC_SHOP_NAME", value: "UK client shop", target: "all", updatedAt: ago(12) },
    { id: "env_6", siteId: "site_3", key: "BOOKING_API_KEY", value: "demo_booking_key", target: "all", updatedAt: ago(20) },
    { id: "env_7", siteId: "site_4", key: "AUTH_SECRET", value: "demo_auth_secret", target: "all", updatedAt: ago(40) },
  ];

  const commitMsgs = ["Update pricing section", "Fix mobile menu overflow", "Add product filters", "Bump Next.js to 16.4", "New booking confirmation email", "Improve image sizes", "Copy changes on About page"];
  const deployments: Deployment[] = [];
  let depN = 0;
  for (const st of sites.filter((x) => x.type !== "wordpress")) {
    for (let i = 0; i < 6; i++) {
      depN++;
      const failed = st.id === "site_4" && i === 1;
      deployments.push({
        id: `dep_${depN}`,
        siteId: st.id,
        status: failed ? "failed" : "ready",
        commit: (0x1a2b3c4 + depN * 7919).toString(16).slice(0, 7),
        message: commitMsgs[(depN + i) % commitMsgs.length] ?? "Update",
        branch: st.branch ?? "main",
        author: st.accountId === "acc_uk" ? (i % 2 ? "Demo Developer" : "Zaffre support") : "Agency Owner",
        createdAt: ago(i * 3 + (st.id === "site_2" ? 0 : 1), 5),
        durationSec: 35 + ((depN * 13) % 60),
      });
    }
  }

  const backups: Backup[] = [];
  let bN = 0;
  for (const st of sites) {
    for (let i = 0; i < 10; i++) {
      bN++;
      backups.push({
        id: `bak_${bN}`,
        siteId: st.id,
        status: i === 0 && st.id === "site_5" ? "running" : "completed",
        kind: i === 3 ? "pre-deploy" : "daily",
        sizeBytes: (st.type === "wordpress" ? 850 : st.type === "nextjs" ? 240 : 12) * 1024 * 1024 + i * 1_048_576,
        createdAt: ago(i, 2),
        location: "R2 · EU",
      });
    }
  }

  const mailboxes: Mailbox[] = [
    { id: "mbx_1", accountId: "acc_uk", address: "info@ukclient.example", domain: "ukclient.example", quotaGb: 10, usedGb: 3.2, createdAt: ago(100) },
    { id: "mbx_2", accountId: "acc_uk", address: "orders@ukclient.example", domain: "ukclient.example", quotaGb: 10, usedGb: 6.8, createdAt: ago(100) },
    { id: "mbx_3", accountId: "acc_uk", address: "hello@shop.ukclient.example", domain: "shop.ukclient.example", quotaGb: 5, usedGb: 0.4, createdAt: ago(20) },
  ];

  const ukLines = subscriptions
    .filter((x) => x.accountId === "acc_uk")
    .map((x) => ({ description: `${getPlan(x.planId)?.name ?? x.planId} (monthly)`, quantity: 1, unitCents: x.priceCents }));

  const invoices: Invoice[] = [
    { id: "inv_a", number: "ZF-2026-0009", accountId: "acc_uk", issuedAt: ago(88), dueAt: ago(81), status: "paid", lines: [...ukLines, { description: "Migration of 6 sites", quantity: 1, unitCents: 0 }], recurring: true },
    { id: "inv_b", number: "ZF-2026-0012", accountId: "acc_uk", issuedAt: ago(58), dueAt: ago(51), status: "paid", lines: ukLines, recurring: true },
    { id: "inv_c", number: "ZF-2026-0015", accountId: "acc_uk", issuedAt: ago(28), dueAt: ago(21), status: "pending_verification", lines: ukLines, recurring: true },
    { id: "inv_d", number: "ZF-2026-0018", accountId: "acc_uk", issuedAt: ago(3), dueAt: inDays(4), status: "unpaid", lines: ukLines, recurring: true },
    { id: "inv_e", number: "ZF-2026-0016", accountId: "acc_agency", issuedAt: ago(20), dueAt: ago(13), status: "unpaid", lines: [{ description: "WordPress Business (monthly)", quantity: 1, unitCents: 2900 }], recurring: true },
  ];

  const payments: Payment[] = [
    { id: "pay_1", invoiceId: "inv_a", accountId: "acc_uk", methodId: "pm_wise", amountCents: 6500, reference: "WISE-48213377", proofFileName: "wise-receipt.png", proofMime: "image/png", proofSize: 184_220, status: "approved", submittedAt: ago(83), submittedBy: "usr_billing", reviewedAt: ago(82), reviewedBy: "usr_admin" },
    { id: "pay_2", invoiceId: "inv_b", accountId: "acc_uk", methodId: "pm_bank", amountCents: 6500, reference: "FT26-551902", proofFileName: "bank-transfer.pdf", proofMime: "application/pdf", proofSize: 92_011, status: "approved", submittedAt: ago(53), submittedBy: "usr_billing", reviewedAt: ago(52), reviewedBy: "usr_admin" },
    { id: "pay_3", invoiceId: "inv_c", accountId: "acc_uk", methodId: "pm_wise", amountCents: 6500, reference: "WISE-49120045", proofFileName: "wise-oct.png", proofMime: "image/png", proofSize: 201_557, status: "pending_verification", submittedAt: ago(1, 4), submittedBy: "usr_owner" },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: "pm_wise",
      kind: "wise",
      label: "Wise (USD)",
      instructions: "Send USD with Wise to the account below. Put your invoice number in the reference.",
      fields: [
        { label: "Account name", value: "DEMO – set in admin" },
        { label: "Wise email", value: "payments@zaffrehost.com" },
        { label: "Currency", value: "USD" },
      ],
      enabled: true,
    },
    {
      id: "pm_bank",
      kind: "bank_transfer",
      label: "Bank transfer (USD)",
      instructions: "International transfer in USD. Your bank may charge a fee; please make sure the full invoice amount arrives.",
      fields: [
        { label: "Account name", value: "DEMO – set in admin" },
        { label: "Account number / IBAN", value: "DEMO0000000000" },
        { label: "SWIFT / BIC", value: "DEMOXXXX" },
        { label: "Bank name", value: "DEMO – set in admin" },
      ],
      enabled: true,
    },
  ];

  const tickets: Ticket[] = [
    {
      id: "tkt_1",
      number: 1042,
      accountId: "acc_uk",
      siteId: "site_4",
      subject: "Client portal feels slow this morning",
      status: "awaiting_client",
      priority: "high",
      createdAt: ago(0, 6),
      updatedAt: ago(0, 1),
      messages: [
        { id: "m1", authorId: "usr_owner", authorName: "Demo Owner", fromStaff: false, body: "Hi, the client portal is taking a few seconds to load the dashboard page. Can you take a look?", attachments: [{ name: "screenshot.png", size: 240_112 }], createdAt: ago(0, 6) },
        { id: "m2", authorId: "usr_admin", authorName: "Zaffre support", fromStaff: true, body: "Thanks for flagging this. A database query on /dashboard is slow after yesterday's deploy. We've added an index and response time is back under 300 ms. Could you check it on your side?", attachments: [], createdAt: ago(0, 1) },
      ],
    },
    {
      id: "tkt_2",
      number: 1037,
      accountId: "acc_uk",
      siteId: "site_5",
      subject: "Please update the blog theme",
      status: "closed",
      priority: "normal",
      createdAt: ago(9),
      updatedAt: ago(8),
      messages: [
        { id: "m3", authorId: "usr_owner", authorName: "Demo Owner", fromStaff: false, body: "The theme says there's an update. Can you apply it safely?", attachments: [], createdAt: ago(9) },
        { id: "m4", authorId: "usr_admin", authorName: "Zaffre support", fromStaff: true, body: "Done. We took a backup first, applied the update on staging, checked the main pages and then updated live.", attachments: [], createdAt: ago(8) },
      ],
    },
    {
      id: "tkt_3",
      number: 1044,
      accountId: "acc_agency",
      siteId: null,
      subject: "Add a new client site",
      status: "open",
      priority: "normal",
      createdAt: ago(0, 3),
      updatedAt: ago(0, 3),
      messages: [{ id: "m5", authorId: "usr_agency", authorName: "Agency Owner", fromStaff: false, body: "We have a new static site to host. What do you need from us?", attachments: [], createdAt: ago(0, 3) }],
    },
  ];

  const notifications: Notification[] = [
    { id: "ntf_1", accountId: "acc_uk", kind: "ticket_reply", title: "Support replied to #1042", body: "A database index was added; please check the client portal.", href: "/dashboard/support/tkt_1", read: false, createdAt: ago(0, 1) },
    { id: "ntf_2", accountId: "acc_uk", kind: "site_up", title: "Blog is back up", body: "blog.ukclient.example recovered after 2 hours of downtime. Cause: plugin update conflict, rolled back.", href: "/dashboard/sites/site_5", read: false, createdAt: ago(0, 2) },
    { id: "ntf_3", accountId: "acc_uk", kind: "site_down", title: "Blog is down", body: "blog.ukclient.example is not responding. We're on it.", href: "/dashboard/sites/site_5", read: true, createdAt: ago(0, 4) },
    { id: "ntf_4", accountId: "acc_uk", kind: "invoice", title: "New invoice ZF-2026-0018", body: "$65.00 due in 7 days.", href: "/dashboard/billing/inv_d", read: false, createdAt: ago(3) },
    { id: "ntf_5", accountId: "acc_uk", kind: "deploy", title: "Online shop deployed", body: "\"Add product filters\" is live.", href: "/dashboard/sites/site_2/deployments", read: true, createdAt: ago(0, 5) },
    { id: "ntf_6", accountId: "acc_uk", kind: "payment_confirmed", title: "Payment confirmed for ZF-2026-0012", body: "Thank you. Your payment of $65.00 was received.", href: "/dashboard/billing/inv_b", read: true, createdAt: ago(52) },
  ];

  const notificationPrefs: NotificationPrefs[] = users.map((u) => ({
    userId: u.id,
    email: Object.fromEntries(allKinds.map((k) => [k, true])) as Record<NotificationKind, boolean>,
    whatsapp: Object.fromEntries(allKinds.map((k) => [k, k === "site_down" || k === "site_up"])) as Record<NotificationKind, boolean>,
  }));

  const auditLog: AuditEvent[] = [
    { id: "aud_1", actorId: "usr_owner", actorName: "Demo Owner", accountId: "acc_uk", action: "team.invite", target: "freelancer@studio.example (developer)", createdAt: ago(2) },
    { id: "aud_2", actorId: "usr_owner", actorName: "Demo Owner", accountId: "acc_uk", action: "payment.submit", target: "ZF-2026-0015", createdAt: ago(1, 4) },
    { id: "aud_3", actorId: "usr_dev", actorName: "Demo Developer", accountId: "acc_uk", action: "env.update", target: "Online shop: DATABASE_URL", createdAt: ago(12) },
    { id: "aud_4", actorId: "usr_admin", actorName: "Zaffre Admin", accountId: "acc_uk", action: "site.restart", target: "Blog", createdAt: ago(0, 2) },
    { id: "aud_5", actorId: "usr_owner", actorName: "Demo Owner", accountId: "acc_uk", action: "auth.sign_in", target: "Chrome on macOS", createdAt: ago(0, 7) },
  ];

  const sessions: SessionRecord[] = [
    { id: "ses_1", userId: "usr_owner", device: "Chrome on macOS", location: "Approximate location hidden in demo", lastActiveAt: ago(0, 0), current: true },
    { id: "ses_2", userId: "usr_owner", device: "Safari on iPhone", location: "Approximate location hidden in demo", lastActiveAt: ago(1, 2), current: false },
  ];

  const adminNotes: AdminNote[] = [
    { id: "note_1", accountId: "acc_uk", authorName: "Zaffre Admin", body: "First client. Migrated 4 Next.js apps from several platform accounts, 1 WordPress and 1 static site. Prefers WhatsApp for urgent issues.", createdAt: ago(110) },
  ];

  const announcement: Announcement = {
    enabled: false,
    tone: "info",
    message: "Planned maintenance on Sunday 02:00–03:00 UTC. Sites stay online; deploys pause for up to 10 minutes.",
    updatedAt: ago(5),
  };

  const emailTemplates: EmailTemplate[] = [
    { id: "tpl_invoice", name: "New invoice", subject: "Invoice {{invoice.number}} for {{invoice.total}}", body: "Hi {{user.name}},\n\nYour invoice {{invoice.number}} for {{invoice.total}} is ready. It is due on {{invoice.dueDate}}.\n\nView and pay: {{invoice.url}}\n\nThank you,\nZaffre", updatedAt: ago(30) },
    { id: "tpl_payment", name: "Payment confirmed", subject: "Payment received for {{invoice.number}}", body: "Hi {{user.name}},\n\nWe've confirmed your payment of {{payment.amount}} for invoice {{invoice.number}}. Thank you.\n\nZaffre", updatedAt: ago(30) },
    { id: "tpl_down", name: "Site down", subject: "{{site.name}} is down. We're on it", body: "Hi {{user.name}},\n\nOur monitoring shows {{site.domain}} is not responding since {{event.time}}. An engineer is already looking at it. We'll email you again when it's back.\n\nZaffre", updatedAt: ago(30) },
    { id: "tpl_up", name: "Site back up", subject: "{{site.name}} is back up", body: "Hi {{user.name}},\n\n{{site.domain}} is responding again. Downtime: {{event.duration}}. Cause: {{event.cause}}.\n\nZaffre", updatedAt: ago(30) },
    { id: "tpl_ticket", name: "Ticket reply", subject: "Re: {{ticket.subject}} [#{{ticket.number}}]", body: "Hi {{user.name}},\n\n{{message.body}}\n\nReply here or in your dashboard: {{ticket.url}}\n\nZaffre support", updatedAt: ago(30) },
    { id: "tpl_invite", name: "Team invite", subject: "You've been invited to {{account.name}} on Zaffre", body: "Hi,\n\n{{inviter.name}} invited you to join {{account.name}} as {{invite.role}}.\n\nAccept: {{invite.url}}\n\nZaffre", updatedAt: ago(30) },
  ];

  return {
    users,
    accounts,
    memberships,
    invites,
    servers,
    subscriptions,
    sites,
    domains,
    envVars,
    deployments,
    backups,
    restoreRequests: [],
    mailboxes,
    invoices,
    payments,
    paymentMethods,
    tickets,
    notifications,
    notificationPrefs,
    auditLog,
    sessions,
    adminNotes,
    announcement,
    emailTemplates,
    counters: { invoice: 18, ticket: 1044, id: 1000 },
  };
}
