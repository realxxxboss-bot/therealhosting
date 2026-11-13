import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers";

const pages = ["/", "/pricing", "/features", "/hosting/nextjs", "/migration", "/domains", "/status", "/contact", "/about", "/blog", "/legal/privacy", "/legal/terms", "/sign-in", "/credits", "/hosting/wordpress", "/blog/renewal-prices-explained"];

for (const path of pages) {
  test(`${path} renders and passes axe`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await expectNoA11yViolations(page);
  });
}

test("pricing toggles to yearly", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("radio", { name: /yearly/i }).first().click();
  await expect(page.getByText(/billed once a year/i).first()).toBeVisible();
});

test("never shows fabricated trust claims", async ({ page }) => {
  for (const path of ["/", "/about", "/pricing"]) {
    await page.goto(path);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).not.toContain("trusted by");
    expect(text).not.toMatch(/99\.\d+% uptime last/);
  }
});

test("footer shows the email and social profiles", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.locator('a[href="mailto:info@zaffrehost.com"]').first()).toBeVisible();
  const profiles: [string, string][] = [
    ["Instagram", "https://www.instagram.com/zaffreehost"],
    ["Facebook", "https://www.facebook.com/zaffreehost"],
    ["Threads", "https://www.threads.com/@zaffreehost"],
  ];
  for (const [name, href] of profiles) {
    await expect(footer.getByRole("link", { name: `Zaffre on ${name}` })).toHaveAttribute("href", href);
  }
  for (const path of ["/", "/contact", "/legal/privacy", "/about"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/(support|hello)@zaffrehost\.com/);
    expect(text).not.toContain("TODO(confirm)");
  }
});
