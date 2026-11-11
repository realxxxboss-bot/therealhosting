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
  await expect(page.getByText(/page not found|couldn.t find/i).first()).toBeVisible();
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
