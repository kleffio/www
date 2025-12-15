import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { validateTestString } from "../../utils/strings";
import { ProjectDetailPage } from "./project-detail.page";
import { ProjectModal } from "./project-modal";

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
    const detailed = new ProjectDetailPage(this.page);
    const project = this.page.getByRole("cell", { name, exact: true });
    const projectDesc = this.page.getByRole("cell", { name: description, exact: true });

    await expect(project).toBeVisible();
    await expect(projectDesc).toBeVisible();

    await project.click();

    await detailed.expectLoaded();
    await detailed.expectInformation(name, description);
  }

  async createProject(name: string, description: string) {
    const createModal = new ProjectModal(this.page);
    await createModal.open();
    await createModal.expectLoaded();

    await createModal.createProject(name, description);
  }
}
