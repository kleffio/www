import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { UserMenu } from "./user-menu";

export class SettingsPage extends BasePage {
  private userMenu = new UserMenu(this.page);

  async open() {
    await this.userMenu.goProfileSettings();
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard\/settings$/, 30_000);

    await expect(this.page.getByRole("heading", { name: /account settings/i })).toBeVisible({
      timeout: 30_000
    });

    await expect(this.usernameInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.saveButton()).toBeVisible({ timeout: 30_000 });
  }

  usernameInput() {
    return this.page.getByLabel(/^username/i);
  }

  saveButton() {
    return this.page.getByRole("button", { name: /^save$/i });
  }

  successToast() {
    return this.page.getByText("Profile updated successfully.").first();
  }

  errorToast() {
    return this.page
      .getByText(
        /failed to update profile|username and display name are required|Request failed with status code \d{3}/i
      )
      .first();
  }

  getFieldUsername(): Promise<string> {
    return this.usernameInput().inputValue();
  }

  async setUsername(next: string, shouldFail: boolean = false) {
    const input = this.usernameInput();
    await input.fill(next);

    const save = this.saveButton();
    await expect(save).toBeEnabled({ timeout: 30_000 });
    await save.click();

    await expect(this.successToast().or(this.errorToast())).toBeVisible({ timeout: 30_000 });

    if (
      !shouldFail &&
      (await this.errorToast()
        .isVisible()
        .catch(() => false))
    ) {
      throw new Error(`Username update failed for "${next}" (UI displayed an error).`);
    }

    if (
      shouldFail &&
      (await this.successToast()
        .isVisible()
        .catch(() => false))
    ) {
      throw new Error(
        `Username update failed negative condition for "${next}" (UI displayed success on a negative test)`
      );
    }

    await expect(input).toHaveValue(next, { timeout: 30_000 });
  }
}
