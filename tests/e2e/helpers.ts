import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export async function expectNoA11yViolations(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) – ${v.help}`);
  expect(summary).toEqual([]);
}

export async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.fill("#email", email);
  await page.fill("#password", "demo");
  await page.click("button[type=submit]");
}

export async function signInAsAdmin(page: Page) {
  await signIn(page, "admin@zaffrehost.com");
  await page.waitForURL("**/two-factor");
  await page.fill("#code", "123456");
  await page.click("button[type=submit]");
  await page.waitForURL("**/admin");
}
