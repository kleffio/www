import { expect } from "@playwright/test";
import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { SettingsPage } from "../pages/dashboard/settings.page";
import { generateTestString } from "../utils/strings";

test("settings: change username and change it back (prod authentik)", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();

  const preAction = await settings.getLastAuditLogItem();

  const original = await settings.getFieldUsername();

  const tmp = generateTestString("username");

  await settings.setUsername(tmp);
  await settings.expectLoaded();
  const postAction = await settings.getLastAuditLogItem();
  await settings.setUsername(original);

  await settings.expectNewAuditLogItem({ preAction, postAction });
});

test("settings: change username to already in use name (should fail)", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();

  const original = await settings.getFieldUsername();
  const tmp = "akadmin1";
  const preAction = await settings.getLastAuditLogItem();
  await settings.setUsername(tmp, true);

  await page.reload();
  await settings.expectLoaded();
  const currentUsername = await settings.getFieldUsername();
  expect(currentUsername).toBe(original);
  await settings.expectNewAuditLogItem({
    preAction,
    comparator: (pre, post) => {
      expect(post.getTime()).toBe(pre.getTime());
    }
  });
});

test("settings: change display name and change it back", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();

  const preAction = await settings.getLastAuditLogItem();

  const original = await settings.getFieldDisplayName();

  const tmp = generateTestString("displayname");

  await settings.setDisplayName(tmp);
  await settings.expectLoaded();
  const postAction = await settings.getLastAuditLogItem();
  await settings.setDisplayName(original);

  await settings.expectNewAuditLogItem({ preAction, postAction });
});

test("settings: change bio and change it back", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();

  const preAction = await settings.getLastAuditLogItem();

  const original = await settings.getFieldBio();

  const tmp = generateTestString("bio");

  await settings.setBio(tmp);
  await settings.expectLoaded();
  const postAction = await settings.getLastAuditLogItem();
  await settings.setBio(original);

  await settings.expectNewAuditLogItem({ preAction, postAction });
});
