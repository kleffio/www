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

  const original = "isaacwallace123";

  const tmp = `pw_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

  await settings.setUsername(tmp);
  await settings.setUsername(original);
});
