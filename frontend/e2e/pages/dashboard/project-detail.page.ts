import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { routes } from "../../fixtures/test-data";

export class ProjectDetailPage extends BasePage {
  async open(projectId: string) {
    await this.goto(routes.dashboard.project(projectId));
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard\/projects\/[^/]+$/, 30_000);

    await expect(this.page.locator("#root")).toBeVisible({ timeout: 30_000 });
  }

  async expectInformation(name: string, description: string) {
    await expect(this.page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(this.page.getByText(description)).toBeVisible();
  }
}
