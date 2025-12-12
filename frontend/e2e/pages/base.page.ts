import { Page, expect } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async expectAppShellLoaded() {
    await expect(this.page.locator("#root")).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator('a[href="/dashboard"]').first()).toBeVisible({
      timeout: 30_000
    });
  }
}
