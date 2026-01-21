import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { validateTestString } from "../../utils/strings";
import { ProjectDetailPage } from "./project-detail.page";
import { ProjectModal } from "../../components/project-modal";

export class ProjectsPage extends BasePage {
  async open() {
    await this.goto("/dashboard/projects");
  }

  async expectLoaded() {
    await expectPath(this.page, /\/dashboard\/projects$/, 30_000);
    await expect(this.page.getByTestId("projects-page")).toBeVisible({ timeout: 30_000 });

    await expect(
      this.page
        .getByTestId("projects-list")
        .or(this.page.getByTestId("projects-empty"))
        .or(this.page.getByTestId("projects-error"))
    ).toBeVisible({ timeout: 30_000 });
  }

  async expectProject(name: string, description: string) {
    validateTestString(name);

    // Projects are displayed as cards, not table rows
    // Look for the project name in a heading and the description nearby
    await expect(this.page.getByRole("heading", { name, exact: true })).toBeVisible({
      timeout: 10_000
    });

    // Description is optional - only check if provided and not empty
    if (description && description.trim()) {
      await expect(this.page.getByText(description)).toBeVisible({ timeout: 10_000 });
    }
  }

  async openProject(name: string) {
    validateTestString(name);

    // Projects are displayed as cards with links, not table cells
    // Find the link that contains the project name
    const projectLink = this.page
      .locator('a[href*="/dashboard/projects/"]')
      .filter({ hasText: name });
    await projectLink.click();

    const detailPage = new ProjectDetailPage(this.page);
    await detailPage.expectLoaded();
    return detailPage;
  }

  async createProject(name: string, description: string) {
    const createModal = new ProjectModal(this.page);
    await createModal.open();
    await createModal.expectLoaded();
    await createModal.createProject(name, description);
  }
}
