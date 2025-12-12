import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";

export class DashboardPage extends BasePage {
  async open() {
    await this.goto("/dashboard");
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard$/, 30_000);
  }
}
