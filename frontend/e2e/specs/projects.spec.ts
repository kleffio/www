import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { generateTestString } from "../utils/strings";

test("projects: create new project from dashboard", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const tmpName = generateTestString("project");
  const tmpDesc = "This is a description:" + tmpName;

  await dash.createProject(tmpName, tmpDesc);
});

test("projects: create new project from projects page", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.open();
  await dash.expectLoaded();

  const projectPage = new ProjectsPage(page);
  await projectPage.open();
  await projectPage.expectLoaded();

  const tmpName = generateTestString("project");
  const tmpDesc = "This is a description:" + tmpName;

  await projectPage.createProject(tmpName, tmpDesc);
});
