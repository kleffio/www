import { expect } from "@playwright/test";
import { BasePage } from "../base.page";
import { ProjectsPage } from "./projects.page";

export class ProjectModal extends BasePage {
  async open() {
    await this.page
      .getByRole("button", { name: "Deploy New Project" })
      .or(this.page.getByRole("button", { name: "Create Project" }))
      .first()
      .click();
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();

    await expect(this.projectCreateModal()).toBeVisible();

    await expect(this.projectNameInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.projectDescriptionInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.createButton()).toBeVisible({ timeout: 30_000 });
  }

  projectCreateModal() {
    return this.page.getByTestId("create-project-modal");
  }

  projectNameInput() {
    return this.page.getByLabel(/^project name/i);
  }

  projectDescriptionInput() {
    return this.page.getByLabel(/^description/i);
  }

  createButton() {
    return this.projectCreateModal().getByRole("button", { name: /^create project$/i });
  }

  async createProject(name: string, description: string) {
    const nameInput = this.projectNameInput();
    await nameInput.fill(name);

    const descInput = this.projectDescriptionInput();
    await descInput.fill(description);

    const create = this.createButton();
    await expect(create).toBeEnabled({ timeout: 30_000 });
    await create.click();

    const projects = new ProjectsPage(this.page);
    await projects.open();
    await projects.expectLoaded();

    await projects.expectProject(name, description);
  }
}
