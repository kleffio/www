import { expect } from "@playwright/test";
import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { SettingsPage } from "../pages/dashboard/settings.page";

test("settings: change username and change it back (prod authentik)", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();

  const original = await settings.getFieldUsername();

  const tmp = `pw_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

  await settings.setUsername(tmp);
  await settings.setUsername(original);
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
  await settings.setUsername(tmp, true);

  await page.reload();
  await settings.expectLoaded();
  const currentUsername = await settings.getFieldUsername();
  expect(currentUsername).toBe(original);
});
