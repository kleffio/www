import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";

export class SystemsPage extends BasePage {
  async expectLoaded() {
    await expectPath(this.page, /\/dashboard\/systems$/, 30_000);
    await expect(this.page.getByTestId("systems-page")).toBeVisible({ timeout: 30_000 });

    await expect(
      this.page.getByTestId("systems-ready").or(this.page.getByTestId("systems-error"))
    ).toBeVisible({ timeout: 30_000 });
  }
}
