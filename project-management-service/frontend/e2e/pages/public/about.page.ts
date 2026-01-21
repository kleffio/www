import { BasePage } from "../base.page";
import { routes } from "../../fixtures/test-data";
import { expectPath } from "../../utils/wait";

export class AboutPage extends BasePage {
  async open() {
    await this.goto(routes.about);
    await expectPath(this.page, /\/about$/);
  }

  async expectLoaded() {
    await expectPath(this.page, /\/about$/);
  }
}
