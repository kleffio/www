import { authTest as test, expect } from "../fixtures/auth.fixture";
import type { Page } from "@playwright/test";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { ProjectDetailPage } from "../pages/dashboard/project-detail.page";
import { ContainerModal } from "../components/container-modal";
import { EditEnvModal } from "../components/edit-env-modal";
import { generateTestString } from "../utils/strings";

import type { Browser } from "@playwright/test";

test.describe("Container Environment Variables", () => {
  let projectName: string;
  let projectDesc: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    projectName = generateTestString("env-project");
    projectDesc = "Project for environment variable tests: " + projectName;

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

  test("create container with environment variables", async ({ page }: { page: Page }) => {
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

    // Create container with environment variables
    await containerModal.createContainer(containerName, "nginx:latest", "8080", undefined, [
      { key: "NODE_ENV", value: "production" },
      { key: "API_URL", value: "https://api.example.com" },
      { key: "DEBUG", value: "true" }
    ]);

    // Verify container was created
    await detailPage.expectContainerExists(containerName);
  });

  test("edit container and add environment variable", async ({ page }: { page: Page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create a container first
    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "node:18-alpine", "3000", undefined, [
      { key: "PORT", value: "3000" }
    ]);

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    // Verify existing variable
    await editEnvModal.expectVariableExists("PORT", "3000");

    // Add new environment variable
    await editEnvModal.addEnvVariable("NEW_VAR", "new_value");

    // Verify the count increased
    const count = await editEnvModal.getEnvVariableCount();
    expect(count).toBe(2);

    // Save changes
    await editEnvModal.saveChanges();
  });

  test("edit container and remove environment variable", async ({ page }: { page: Page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create a container with multiple environment variables
    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "redis:alpine", "6379", undefined, [
      { key: "REDIS_HOST", value: "localhost" },
      { key: "REDIS_PORT", value: "6379" },
      { key: "REDIS_PASSWORD", value: "secret123" }
    ]);

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    // Verify we have 3 variables
    let count = await editEnvModal.getEnvVariableCount();
    expect(count).toBe(3);

    // Remove the second variable (REDIS_PORT)
    await editEnvModal.removeEnvVariableByIndex(1);

    // Verify the count decreased
    count = await editEnvModal.getEnvVariableCount();
    expect(count).toBe(2);

    // Save changes
    await editEnvModal.saveChanges();
  });

  test("edit container and remove all environment variables", async ({ page }: { page: Page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create a container with environment variables
    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "postgres:15-alpine", "5432", undefined, [
      { key: "POSTGRES_USER", value: "admin" },
      { key: "POSTGRES_PASSWORD", value: "password" }
    ]);

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    // Remove all variables
    const count = await editEnvModal.getEnvVariableCount();
    for (let i = count - 1; i >= 0; i--) {
      await editEnvModal.removeEnvVariableByIndex(i);
    }

    // Verify no variables remain
    await editEnvModal.expectNoVariables();

    // Save changes
    await editEnvModal.saveChanges();
  });

  test("edit container and update environment variable values", async ({
    page
  }: {
    page: Page;
  }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create a container with environment variables
    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "mongo:6", "27017", undefined, [
      { key: "MONGO_INITDB_ROOT_USERNAME", value: "olduser" },
      { key: "MONGO_INITDB_ROOT_PASSWORD", value: "oldpass" }
    ]);

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    // Update the values
    await editEnvModal.updateEnvVariable(0, undefined, "newuser");
    await editEnvModal.updateEnvVariable(1, undefined, "newpass");

    // Save changes
    await editEnvModal.saveChanges();
  });

  test("cancel edit without saving environment variables", async ({ page }: { page: Page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const projectCell = page.getByRole("cell", { name: projectName, exact: true });
    await projectCell.click();

    const detailPage = new ProjectDetailPage(page);
    await detailPage.expectLoaded();

    // Create a container with environment variables
    const containerName = generateTestString("container");
    const containerModal = new ContainerModal(page);
    await containerModal.open();
    await containerModal.expectLoaded();

    await containerModal.createContainer(containerName, "mysql:8", "3306", undefined, [
      { key: "MYSQL_ROOT_PASSWORD", value: "rootpass" }
    ]);

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    // Add a new variable
    await editEnvModal.addEnvVariable("MYSQL_DATABASE", "testdb");

    // Cancel without saving
    await editEnvModal.cancelButton().click();

    // Modal should be closed
    await page.waitForTimeout(500);
    await expect(editEnvModal.editEnvModal()).not.toBeVisible();

    // Reopen and verify the variable was not added
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    const count = await editEnvModal.getEnvVariableCount();
    expect(count).toBe(1); // Should still be 1, not 2
  });

  test("create container without environment variables", async ({ page }: { page: Page }) => {
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

    // Create container without environment variables
    await containerModal.createContainer(containerName, "alpine:latest", "8080");

    await detailPage.expectContainerExists(containerName);

    // Open edit env modal and verify no variables
    const editEnvModal = new EditEnvModal(page);
    await editEnvModal.openForContainer(containerName);
    await editEnvModal.expectLoaded();

    await editEnvModal.expectNoVariables();

    await editEnvModal.cancelButton().click();
  });
});
