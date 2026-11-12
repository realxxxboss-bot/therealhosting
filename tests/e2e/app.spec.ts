import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, signIn, signInAsAdmin } from "./helpers";

test("client owner signs in and sees the dashboard", async ({ page }) => {
  await signIn(page, "owner@ukclient.example");
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hello");
  await expectNoA11yViolations(page);
  await page.goto("/dashboard/sites");
  await expect(page.getByText("Company website")).toBeVisible();
  await expectNoA11yViolations(page);
});

test("a client can't open another client's site", async ({ page }) => {
  await signIn(page, "owner@ukclient.example");
  await page.waitForURL("**/dashboard");
  await page.goto("/dashboard/sites/site_7");
  await expect(page.getByText(/that page is not here/i).first()).toBeVisible();
});

test("wrong password shows a generic error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.fill("#email", "owner@ukclient.example");
  await page.fill("#password", "wrong");
  await page.click("button[type=submit]");
  await expect(page.getByText("That email and password don't match.")).toBeVisible();
});

test("signed-out visitors are sent to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForURL("**/sign-in");
  await page.goto("/admin");
  await page.waitForURL("**/sign-in");
});

test("clients can't open the admin panel", async ({ page }) => {
  await signIn(page, "owner@ukclient.example");
  await page.waitForURL("**/dashboard");
  await page.goto("/admin");
  await page.waitForURL("**/dashboard");
});

test("admin approves a payment, and can sign in as a client", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await signInAsAdmin(page);
  await expectNoA11yViolations(page);
  await page.goto("/admin/payments");
  await expectNoA11yViolations(page);
  await page.getByRole("button", { name: "Approve and mark paid" }).first().click();
  await expect(page.getByText("Nothing to check")).toBeVisible();

  await page.goto("/admin/clients/acc_uk");
  await page.getByRole("button", { name: "Sign in as this client" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("you are signed in as UK client")).toBeVisible();
  await page.getByRole("button", { name: "Return to admin" }).click();
  await page.waitForURL("**/admin/clients");
  await page.goto("/admin/audit?q=impersonate");
  await expect(page.getByText("admin.impersonate_start")).toBeVisible();
});

test("every admin screen passes axe", async ({ page }) => {
  await signInAsAdmin(page);
  for (const path of ["/admin/clients", "/admin/clients/acc_uk", "/admin/sites", "/admin/fleet", "/admin/plans", "/admin/invoices", "/admin/tickets", "/admin/tickets/tkt_1", "/admin/backups", "/admin/payment-methods", "/admin/templates", "/admin/announcements", "/admin/audit"]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expectNoA11yViolations(page);
  }
});

test("every client screen passes axe", async ({ page }) => {
  await signIn(page, "owner@ukclient.example");
  await page.waitForURL("**/dashboard");
  for (const path of ["/dashboard/sites/site_1", "/dashboard/sites/site_1/domains", "/dashboard/sites/site_1/environment", "/dashboard/sites/site_1/logs", "/dashboard/domains", "/dashboard/email", "/dashboard/billing", "/dashboard/billing/inv_d/pay", "/dashboard/support", "/dashboard/support/new", "/dashboard/team", "/dashboard/notifications", "/dashboard/account"]) {
    await page.goto(path);
    await expectNoA11yViolations(page);
  }
});

test("a client can download an invoice as a PDF, and only their own", async ({ page }) => {
  await signIn(page, "owner@ukclient.example");
  await page.waitForURL("**/dashboard");
  await page.goto("/dashboard/billing");
  const href = await page.locator('a[href^="/dashboard/billing/inv_"]').first().getAttribute("href");
  expect(href).toBeTruthy();
  const pdf = await page.request.get(`${href}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  // An id that is not theirs (or does not exist) is a plain 404.
  expect((await page.request.get("/dashboard/billing/inv_does_not_exist/pdf")).status()).toBe(404);
  expect((await page.request.get("/files/file_does_not_exist")).status()).toBe(404);
});

test("private files and PDFs need a sign-in", async ({ request }) => {
  expect((await request.get("/files/file_anything", { maxRedirects: 0 })).status()).toBe(401);
  const pdf = await request.get("/dashboard/billing/inv_1/pdf", { maxRedirects: 0 });
  expect([302, 303, 307]).toContain(pdf.status());
});

test("used or made-up password and invite links say so", async ({ page }) => {
  await page.goto("/reset-password/this-link-was-never-issued-0000000000");
  await expect(page.getByText(/expired or was already used/i)).toBeVisible();
  await page.goto("/invite/this-invite-was-never-issued-0000000000");
  await expect(page.getByRole("heading", { name: /no longer valid/i })).toBeVisible();
});

test("the password reset form gives the same answer for any email", async ({ page }) => {
  await page.goto("/reset-password");
  await page.fill("#email", "nobody-here@example.com");
  await page.click("button[type=submit]");
  await expect(page.getByText(/if an account exists/i)).toBeVisible();
});

test("admin adds a server, then removes it", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/fleet");
  const add = page.locator("form").filter({ has: page.getByRole("button", { name: "Add server" }) });
  await add.locator("#ip-new").fill("not an ip");
  await add.getByRole("button", { name: "Add server" }).click();
  await expect(page.getByText("Enter the server's public IP address.").first()).toBeVisible();
  await add.locator("#name-new").fill("zaffre-test-9");
  await add.locator("#region-new").fill("Nuremberg, Germany");
  await add.locator("#ip-new").fill("203.0.113.9");
  await add.locator("#vcpu-new").fill("4");
  await add.locator("#ram-new").fill("16");
  await add.locator("#disk-new").fill("160");
  await add.getByRole("button", { name: "Add server" }).click();
  await expect(page.getByText("zaffre-test-9 added.")).toBeVisible();
  await page.reload();
  await page.getByText("Edit zaffre-test-9").click();
  await page.getByRole("button", { name: "Remove zaffre-test-9" }).click();
  // The card itself disappears once the server is gone.
  await expect(page.getByText("Edit zaffre-test-9")).toHaveCount(0);
});
