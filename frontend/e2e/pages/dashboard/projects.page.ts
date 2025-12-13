import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";

export class ProjectsPage extends BasePage {
  async expectLoaded() {
    await expectPath(this.page, /\/dashboard\/projects$/, 30_000);
    await expect(this.page.getByTestId("projects-page")).toBeVisible({ timeout: 30_000 });

    await expect(
      this.page
        .getByTestId("projects-list")
        .or(this.page.getByTestId("projects-empty"))
        .or(this.page.getByTestId("projects-error"))
    ).toBeVisible({ timeout: 30_000 });
  }
}
