import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { routes } from "../../fixtures/test-data";

export class LandingPage extends BasePage {
  async open() {
    await this.goto(routes.home);
  }

  async expectLoaded() {
    await expect(this.page.locator("body")).toBeVisible();
    await expect(this.page.locator('a[href="/dashboard"]').first()).toBeVisible();
  }
}
