import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { Sidebar } from "../components/sidebar";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { SystemsPage } from "../pages/dashboard/systems.page";
import { SettingsPage } from "../pages/dashboard/settings.page";

test("dashboard: loads", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();
});

test("projects: loads", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const sidebar = new Sidebar(page);
  await sidebar.waitReady();

  await sidebar.projects().click();
  const projects = new ProjectsPage(page);
  await projects.expectLoaded();
});

test("systems: loads", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const sidebar = new Sidebar(page);
  await sidebar.waitReady();

  await sidebar.systems().click();
  const systems = new SystemsPage(page);
  await systems.expectLoaded();
});

test("settings: loads", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const settings = new SettingsPage(page);
  await settings.open();
  await settings.expectLoaded();
});
