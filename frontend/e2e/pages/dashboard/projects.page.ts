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
    const project = this.page.getByRole("cell", { name, exact: true });
    const projectDesc = this.page.getByRole("cell", { name: description, exact: true });

    await expect(project).toBeVisible();
    await expect(projectDesc).toBeVisible();
  }

  async openProject(name: string) {
    validateTestString(name);
    const project = this.page.getByRole("cell", { name, exact: true });
    await project.click();

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
