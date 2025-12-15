import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { ProjectDetailPage } from "../pages/dashboard/project-detail.page";
import { ContainerModal } from "../components/container-modal";
import { generateTestString } from "../utils/strings";

test.describe("Project Creation", () => {
  test("create new project from dashboard", async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();

    const tmpName = generateTestString("project");
    const tmpDesc = "This is a description:" + tmpName;

    await dash.createProject(tmpName, tmpDesc);
  });

  test("create new project from projects page", async ({ page }) => {
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
});

test.describe("Container Management", () => {
  let projectName: string;
  let projectDesc: string;

  test.beforeAll(async ({ browser }) => {
    projectName = generateTestString("project");
    projectDesc = "Project for container tests: " + projectName;

    const context = await browser.newContext({
      storageState: "e2e/storage/auth.json"
    });
    const page = await context.newPage();

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, projectDesc);

    await context.close();
  });

  test("create container with basic info", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "nginx:latest", "8080");
  });

  test("create container with repository", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "node:18-alpine", "3000", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });
  });

  test("create multiple containers in same project", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const container1 = generateTestString("container");
    let containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(container1, "nginx:latest", "8080");

    const container2 = generateTestString("container");
    containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(container2, "redis:alpine", "6379");

    await detailPage.expectContainerExists(container1);
    await detailPage.expectContainerExists(container2);
  });
});
