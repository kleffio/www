import { BasePage } from "../base.page";
import { routes } from "../../fixtures/test-data";
import { expectPath } from "../../utils/wait";

export class StatusPage extends BasePage {
  async open() {
    await this.goto(routes.status);
    await expectPath(this.page, /\/status$/);
  }

  async expectLoaded() {
    await expectPath(this.page, /\/status$/);
  }
}
