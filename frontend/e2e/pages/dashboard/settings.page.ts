import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { UserMenu } from "./user-menu";
import { SettingsAuditItem } from "../../utils/types";

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

    await this.page.getByTestId("settings-profile-skeleton").waitFor({ state: "hidden" });
    await this.page.getByTestId("settings-audit-skeleton").waitFor({ state: "hidden" });

    await expect(this.usernameInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.displayNameInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.avatarURLInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.bioInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.saveButton()).toBeVisible({ timeout: 30_000 });
    await expect(this.auditLogList()).toBeVisible({ timeout: 30_000 });
  }

  usernameInput() {
    return this.page.getByLabel(/^username/i);
  }

  displayNameInput() {
    return this.page.getByLabel(/^display name/i);
  }

  avatarURLInput() {
    return this.page.getByLabel(/^avatar url/i);
  }

  bioInput() {
    return this.page.getByLabel(/^bio/i);
  }

  auditLogList() {
    return this.page.getByTestId("settings-audit-list");
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

  getFieldBio(): Promise<string> {
    return this.bioInput().inputValue();
  }

  getFieldDisplayName(): Promise<string> {
    return this.displayNameInput().inputValue();
  }

  getFieldAvatarURL(): Promise<string> {
    return this.avatarURLInput().inputValue();
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

  async setDisplayName(next: string) {
    const input = this.displayNameInput();
    await input.fill(next);

    const save = this.saveButton();
    await expect(save).toBeEnabled({ timeout: 30_000 });
    await save.click();

    await expect(this.successToast().or(this.errorToast())).toBeVisible({ timeout: 30_000 });

    if (
      await this.errorToast()
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(`Display name update failed for "${next}" (UI displayed an error).`);
    }

    await expect(input).toHaveValue(next, { timeout: 30_000 });
  }

  async setAvatarURL(next: string) {
    const input = this.avatarURLInput();
    await input.fill(next);

    const save = this.saveButton();
    await expect(save).toBeEnabled({ timeout: 30_000 });
    await save.click();

    await expect(this.successToast().or(this.errorToast())).toBeVisible({ timeout: 30_000 });

    if (
      await this.errorToast()
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(`Avatar URL update failed for "${next}" (UI displayed an error).`);
    }

    await expect(input).toHaveValue(next, { timeout: 30_000 });
  }

  async setBio(next: string) {
    const input = this.bioInput();
    await input.fill(next);

    const save = this.saveButton();
    await expect(save).toBeEnabled({ timeout: 30_000 });
    await save.click();

    await expect(this.successToast().or(this.errorToast())).toBeVisible({ timeout: 30_000 });

    if (
      await this.errorToast()
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(`Bio update failed for "${next}" (UI displayed an error).`);
    }

    await expect(input).toHaveValue(next, { timeout: 30_000 });
  }

  private parseAuditHTMLToJSON(inner: string) {
    const struct = inner.split("\n");

    return {
      action: struct[0],
      userMeta: struct[1],
      timestring: struct[2]
    };
  }

  async getLastAuditLogItem() {
    return this.parseAuditHTMLToJSON(
      (await this.auditLogList().locator("div").first().allInnerTexts()).join("\n")
    );
  }

  async expectNewAuditLogItem({
    preAction,
    postAction,
    comparator
  }: {
    preAction: SettingsAuditItem;
    postAction?: SettingsAuditItem;
    comparator?: (pre: Date, post: Date) => void;
  }) {
    if (!postAction) {
      postAction = await this.getLastAuditLogItem();
    }

    const preActionDate = new Date(preAction.timestring);
    const postActionDate = new Date(postAction.timestring);

    if (comparator) {
      comparator(preActionDate, postActionDate);
    } else {
      expect(postActionDate.getTime()).toBeGreaterThan(preActionDate.getTime());
    }
  }
}
