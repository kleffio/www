import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { ProjectModal } from "../../components/project-modal";

export class DashboardPage extends BasePage {
  async open() {
    await this.goto("/dashboard");
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard$/, 30_000);
  }

  async createProject(name: string, description: string) {
    const createModal = new ProjectModal(this.page);
    await createModal.open();
    await createModal.expectLoaded();
    await createModal.createProject(name, description);
  }
}
