import type { MailboxAdapter } from "../types";

export const mockMailboxAdapter: MailboxAdapter = {
  name: "Mock Migadu",
  webmailUrl: "https://webmail.zaffrehost.com",
  async create(address) {
    return { setupUrl: `https://webmail.zaffrehost.com/setup?demo=${encodeURIComponent(address)}` };
  },
  async resetPassword(address) {
    return { resetUrl: `https://webmail.zaffrehost.com/reset?demo=${encodeURIComponent(address)}` };
  },
  async dnsStatus(domain) {
    const allOk = !domain.includes("shop");
    return [
      { label: "MX", ok: true, record: { type: "MX", name: "@", value: "mx1.mail.zaffrehost.com", priority: 10 } },
      { label: "SPF", ok: true, record: { type: "TXT", name: "@", value: "v=spf1 include:spf.mail.zaffrehost.com -all" } },
      { label: "DKIM", ok: allOk, record: { type: "CNAME", name: "key1._domainkey", value: `key1.${domain}._domainkey.mail.zaffrehost.com` } },
      { label: "DMARC", ok: allOk, record: { type: "TXT", name: "_dmarc", value: "v=DMARC1; p=quarantine;" } },
    ];
  },
};
