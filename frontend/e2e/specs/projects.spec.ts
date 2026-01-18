import { expect } from "@playwright/test";
import { authTest as test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { ProjectDetailPage } from "../pages/dashboard/project-detail.page";
import { ContainerModal } from "../components/container-modal";
import { ContainerDetailModal } from "../components/container-detail-modal";
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

test.describe("Container Identification System", () => {
  test("container ID is displayed as UUID in detail modal", async ({ page }) => {
    const projectName = generateTestString("id-project");
    const containerName = generateTestString("id-container");

    // Setup: create project and container
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for container identification testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Test: verify container ID is displayed as UUID
    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.expectContainerIdIsUUID();
  });

  test("container detail modal visit app uses containerId in URL", async ({ page }) => {
    const projectName = generateTestString("url-project");
    const containerName = generateTestString("url-container");

    // Setup: create project and container
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for URL testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Test: verify visit app URL uses containerId
    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    const containerId = await containerDetailModal.getContainerId();
    await containerDetailModal.expectVisitAppUrl(containerId);
  });

  test("container status card visit app uses prefixed containerId in URL", async ({ page }) => {
    const projectName = generateTestString("status-project");
    const containerName = generateTestString("status-container");

    // Setup: create project and container
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for status card URL testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Test: verify status card visit app URL
    // Get containerId from detail modal first
    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);
    const containerId = await containerDetailModal.getContainerId();
    await containerDetailModal.close();

    // Now test the status card URL
    await detailPage.expectContainerStatusCardVisitAppUrl(containerName, containerId);
  });

  test("container ID can be copied from detail modal", async ({ page }) => {
    const projectName = generateTestString("copy-project");
    const containerName = generateTestString("copy-container");

    // Setup: create project and container
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for copy testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Test: verify container ID can be copied
    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.copyContainerId();
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

    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });
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

    await containerModal.createContainer(containerName, "3000", {
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
    await containerModal.createContainer(container1, "8080");

    const container2 = generateTestString("container");
    containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(container2, "6379");

    await detailPage.expectContainerExists(container1);
    await detailPage.expectContainerExists(container2);
  });
});

test.describe("Project Metrics", () => {
  let projectName: string;
  let containerName: string;

  test.beforeAll(async ({ browser }) => {
    projectName = generateTestString("metrics-project");
    containerName = generateTestString("container");

    const context = await browser.newContext({
      storageState: "e2e/storage/auth.json"
    });
    const page = await context.newPage();

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for metrics testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080");

    await context.close();
  });

  test("displays metrics section when project has containers", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    await detailPage.expectRunningContainersSection();
    await detailPage.expectContainerExists(containerName);

    await detailPage.expectMetricsVisible();
    await detailPage.expectMetricsLoaded();
  });

  test("displays all metric cards", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    await detailPage.expectRunningContainersSection();
    await detailPage.expectContainerExists(containerName);

    await detailPage.expectAllMetricCardsVisible();
  });

  test("metrics section positioned between project overview and running containers", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

 
    await detailPage.expectRunningContainersSection();
    await detailPage.expectContainerExists(containerName);


    await detailPage.expectMetricsBetweenSections();
  });

  test("does not display metrics on project without containers", async ({ page }) => {
    const emptyProjectName = generateTestString("empty-project");
    
    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(emptyProjectName, "Empty project for testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: emptyProjectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    await detailPage.expectMetricsNotVisible();
  });

  test("metrics update when containers are present", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Wait for container to appear
    await detailPage.expectRunningContainersSection();
    await detailPage.expectContainerExists(containerName);

    // Then check metrics are visible and loaded
    await detailPage.expectMetricsVisible();
    await detailPage.expectMetricsLoaded();
  });
});

test.describe("Container Detail Modal", () => {
  let projectName: string;
  let containerName: string;

  test.beforeAll(async ({ browser }) => {
    projectName = generateTestString("detail-modal-project");
    containerName = generateTestString("detail-container");

    const context = await browser.newContext({
      storageState: "e2e/storage/auth.json"
    });
    const page = await context.newPage();

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(projectName, "Project for container detail modal testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(containerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    }, [
      { key: "NODE_ENV", value: "production" },
      { key: "PORT", value: "8080" }
    ]);

    await context.close();
  });

  test("opens container detail modal when clicking on container", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    await detailPage.expectContainerExists(containerName);

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);
  });

  test("displays correct container information", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.expectContainerDetails(containerName, {
      status: "running",
      ports: ["8080"],
      branch: "main",
      hasEnvVars: true,
      envVarCount: 2
    });
  });

  test("displays action buttons", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.expectActionButtonsVisible();
  });

  test("closes modal when clicking close button", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.close();
  });

  test("copy container ID functionality", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.copyContainerId();
  });

  test("opens source code repository in new tab", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    const newPage = await containerDetailModal.openSourceCode();
    expect(newPage.url()).toContain("github.com");
    await newPage.close();
  });

  test("opens edit environment variables modal", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.clickEditEnvironmentVariables();
  });

  test("opens edit container modal", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    await containerDetailModal.clickEditContainer();
  });

  test("updates container name successfully", async ({ page }) => {
    // Create a new project and container for this test
    const testProjectName = generateTestString("update-name-project");
    const testContainerName = generateTestString("update-name-container");

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(testProjectName, "Project for container name update testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: testProjectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create container
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(testContainerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(testContainerName);
    await containerDetailModal.expectLoaded(testContainerName);

    // Click edit container
    await containerDetailModal.clickEditContainer();

    // Verify we're in edit mode
    await containerModal.expectEditMode();

    // Update container name
    const newContainerName = generateTestString("updated-container");
    await containerModal.updateContainer(newContainerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Verify container appears with new name
    await detailPage.expectContainerExists(newContainerName);

    // Verify old container name no longer exists
    const oldContainer = page.getByText(testContainerName, { exact: true });
    await expect(oldContainer).not.toBeVisible();
  });

  test("updates container port successfully", async ({ page }) => {
    // Create a new project and container for this test
    const testProjectName = generateTestString("update-port-project");
    const testContainerName = generateTestString("update-port-container");

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(testProjectName, "Project for container port update testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: testProjectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create container
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(testContainerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(testContainerName);
    await containerDetailModal.expectLoaded(testContainerName);

    // Click edit container
    await containerDetailModal.clickEditContainer();

    // Verify we're in edit mode
    await containerModal.expectEditMode();

    // Update container port
    const newPort = "3000";
    await containerModal.updateContainer(testContainerName, newPort, {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    // Verify container details show updated port
    await detailPage.openContainerDetailModal(testContainerName);
    await containerDetailModal.expectLoaded(testContainerName);

    await containerDetailModal.expectContainerDetails(testContainerName, {
      ports: [newPort]
    });
  });

  test("updates container repository details", async ({ page }) => {
    // Create a new project and container for this test
    const testProjectName = generateTestString("update-repo-project");
    const testContainerName = generateTestString("update-repo-container");

    const dash = new DashboardPage(page);
    await dash.open();
    await dash.expectLoaded();
    await dash.createProject(testProjectName, "Project for container repo update testing");

    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: testProjectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create container
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();
    await containerModal.createContainer(testContainerName, "8080", {
      url: "https://github.com/user/repo.git",
      branch: "main"
    });

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(testContainerName);
    await containerDetailModal.expectLoaded(testContainerName);

    // Click edit container
    await containerDetailModal.clickEditContainer();

    // Verify we're in edit mode
    await containerModal.expectEditMode();

    // Update repository details
    const newRepoUrl = "https://github.com/updated/repo.git";
    const newBranch = "develop";

    await containerModal.updateContainer(testContainerName, "8080", {
      url: newRepoUrl,
      branch: newBranch
    });

    // Verify container details show updated repository info
    await detailPage.openContainerDetailModal(testContainerName);
    await containerDetailModal.expectLoaded(testContainerName);

    await containerDetailModal.expectContainerDetails(testContainerName, {
      branch: newBranch
    });
  });

  test("shows validation error for empty container name", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    // Click edit container
    await containerDetailModal.clickEditContainer();

    // Verify we're in edit mode
    const containerModal = new ContainerModal(page);
    await containerModal.expectEditMode();

    // Try to update with empty name
    await containerModal.containerNameInput().fill("");
    await containerModal.containerNameInput().blur(); // Trigger validation on blur
    await page.waitForTimeout(100); // Allow validation to process
    await containerModal.updateButton().click();

    // Should show validation error - wait for the error message to appear
    await expect(page.getByText("Container name is required.")).toBeVisible({ timeout: 5000 });

    // Modal should still be open
    await containerModal.expectLoaded();
  });

  test("shows validation error for invalid port", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    const containerDetailModal = new ContainerDetailModal(page);
    await detailPage.openContainerDetailModal(containerName);
    await containerDetailModal.expectLoaded(containerName);

    // Click edit container
    await containerDetailModal.clickEditContainer();

    // Verify we're in edit mode
    const containerModal = new ContainerModal(page);
    await containerModal.expectEditMode();

    // Try to update with invalid port (0 is not a positive number)
    await containerModal.portInput().fill("0");
    await containerModal.updateButton().click();

    // Should show validation error - wait for the error message to appear
    await expect(page.getByText("Port must be a positive number.")).toBeVisible({ timeout: 5000 });

    // Modal should still be open
    await containerModal.expectLoaded();
  });
});
