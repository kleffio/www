import { Page, expect } from "@playwright/test";

export class Sidebar {
  constructor(private readonly page: Page) {}

  private link(href: string) {
    return this.page.locator(`a[href="${href}"]`).first();
  }

  async waitReady() {
    await expect(this.link("/dashboard")).toBeVisible({ timeout: 30_000 });
  }

  dashboard() {
    return this.link("/dashboard");
  }

  projects() {
    return this.link("/dashboard/projects");
  }

  systems() {
    return this.link("/dashboard/systems");
  }
}
