import { BasePage } from "../base.page";
import { routes } from "../../fixtures/test-data";
import { expectPath } from "../../utils/wait";

export class LegalPage extends BasePage {
  async openFAQ() {
    await this.goto(routes.faq);
    await expectPath(this.page, /\/faq$/);
  }
  async openTerms() {
    await this.goto(routes.terms);
    await expectPath(this.page, /\/terms$/);
  }
  async openPrivacy() {
    await this.goto(routes.privacy);
    await expectPath(this.page, /\/privacy$/);
  }
}
