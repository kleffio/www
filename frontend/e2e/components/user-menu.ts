import { Page, expect, Locator } from "@playwright/test";

export class UserMenu {
  constructor(private readonly page: Page) {}

  private root(): Locator {
    return this.page.locator("div.absolute.z-50.w-44");
  }

  private toggleButton(): Locator {
    return this.page.getByText(/@/).first().locator("xpath=ancestor::button[1]");
  }

  async open() {
    for (let i = 0; i < 3; i++) {
      await this.toggleButton()
        .click({ trial: i < 2 })
        .catch(() => {});
      await this.toggleButton()
        .click()
        .catch(() => {});
      if (await this.root().count()) break;
    }
    await expect(this.root()).toBeVisible({ timeout: 10_000 });
  }

  async goDashboard() {
    await this.open();
    await this.page.getByRole("button", { name: /^Dashboard$/ }).click();
  }

  async goProfileSettings() {
    await this.open();
    await this.page.getByRole("button", { name: /^Profile & settings$/ }).click();
  }

  async signOut() {
    await this.open();
    await this.page.getByRole("button", { name: /^Sign out$/ }).click();
  }
}
