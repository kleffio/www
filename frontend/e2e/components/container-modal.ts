import { expect } from "@playwright/test";
import { BaseComponent } from "./base.component";

/**
 * Container creation modal component
 * Used on project detail pages to create new containers
 */
export class ContainerModal extends BaseComponent {
  async open() {
    await this.page
      .getByRole("button", { name: /create container/i })
      .first()
      .click();
  }

  async expectLoaded() {
    // Wait for the modal to appear
    await expect(this.containerCreateModal()).toBeVisible({ timeout: 30_000 });

    await expect(this.containerNameInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.portInput()).toBeVisible({ timeout: 30_000 });
    await expect(this.createButton()).toBeVisible({ timeout: 30_000 });
  }

  containerCreateModal() {
    return this.page.locator("section.fixed.inset-0.z-50");
  }

  containerNameInput() {
    return this.page.locator("#container-name");
  }

  imageInput() {
    return this.page.locator("#container-image");
  }

  portInput() {
    return this.page.locator("#container-port");
  }

  repositoryUrlInput() {
    return this.page.locator("#container-repo-url");
  }

  branchInput() {
    return this.page.locator("#container-branch");
  }

  createButton() {
    return this.page.locator('button[type="submit"]').filter({ hasText: /create container/i });
  }

  addEnvVariableButton() {
    return this.page.getByRole("button", { name: /add variable/i });
  }

  envKeyInput(index: number) {
    return this.page.locator('input[placeholder="KEY"]').nth(index);
  }

  envValueInput(index: number) {
    return this.page.locator('input[placeholder="value"]').nth(index);
  }

  removeEnvButton(index: number) {
    return this.page.locator('button').filter({ has: this.page.locator('svg.lucide-trash-2') }).nth(index);
  }

  async fillBasicInfo(name: string, image: string, port: string) {
    await this.containerNameInput().fill(name);
    await this.portInput().fill(port);
  }

  async fillRepository(url: string, branch: string = "main") {
    const repoInput = this.repositoryUrlInput();
    if (await repoInput.isVisible()) {
      await repoInput.fill(url);
    }

    const branchInput = this.branchInput();
    if (await branchInput.isVisible()) {
      await branchInput.fill(branch);
    }
  }

  async addEnvVariable(key: string, value: string) {
    // Click add variable button
    await this.addEnvVariableButton().click();
    
    // Wait a moment for the inputs to appear
    await this.page.waitForTimeout(300);
    
    // Get the count of current env variables
    const keyInputs = this.page.locator('input[placeholder="KEY"]');
    const count = await keyInputs.count();
    
    // Fill the last added (newest) env variable
    await this.envKeyInput(count - 1).fill(key);
    await this.envValueInput(count - 1).fill(value);
  }

  async createContainer(
    name: string,
    image: string,
    port: string,
    repository?: { url: string; branch?: string },
    envVariables?: Array<{ key: string; value: string }>
  ) {
    await this.fillBasicInfo(name, image, port);

    if (repository) {
      await this.fillRepository(repository.url, repository.branch);
    }

    if (envVariables && envVariables.length > 0) {
      for (const env of envVariables) {
        await this.addEnvVariable(env.key, env.value);
      }
    }

    const create = this.createButton();
    await expect(create).toBeEnabled({ timeout: 30_000 });
    await create.click();

    // Wait for the modal to close
    const modal = this.containerCreateModal();
    await expect(modal).not.toBeVisible({ timeout: 30_000 });

    // Wait for the container to appear in the list
    await this.expectContainerInList(name);
  }

  async expectContainerInList(name: string) {
    // Wait a bit for the container to be created
    await this.page.waitForTimeout(2000);

    // Look for the container name in the page
    const container = this.page.getByText(name, { exact: true });
    await expect(container).toBeVisible({ timeout: 30_000 });
  }
}
