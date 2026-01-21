import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { routes } from "../../fixtures/test-data";

export class CallbackPage extends BasePage {
  async openSignin() {
    await this.goto(routes.auth.signin);
  }

  async openCallback() {
    await this.goto(routes.auth.callback);
  }

  async expectRedirectCardVisible() {
    await expect(this.page.getByTestId("auth-callback")).toBeVisible();
  }
}
