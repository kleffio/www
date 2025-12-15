import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { routes } from "../../fixtures/test-data";

export class ProjectDetailPage extends BasePage {
  async open(projectId: string) {
    await this.goto(routes.dashboard.project(projectId));
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard\/projects\/[^/]+$/, 30_000);

    await expect(this.page.locator("#root")).toBeVisible({ timeout: 30_000 });
  }

  async expectInformation(name: string, description: string) {
    await expect(this.page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(this.page.getByText(description)).toBeVisible();
  }

  async goBackToProjects() {
    await this.page.getByRole("link", { name: /back to projects/i }).click();
  }

  // Container-related methods
  async expectRunningContainersSection() {
    await expect(this.page.getByText(/running containers/i)).toBeVisible({ timeout: 30_000 });
  }

  async expectNoContainers() {
    await expect(this.page.getByText(/no running containers/i)).toBeVisible({ timeout: 30_000 });
  }

  async expectContainerExists(containerName: string) {
    // Simple text search - same approach as ContainerModal
    const container = this.page.getByText(containerName, { exact: true });
    await expect(container).toBeVisible({ timeout: 30_000 });
  }

  async getContainerCount() {
    const containers = this.page.locator('[data-container-name], [data-testid="container-row"]');
    return await containers.count();
  }
}
