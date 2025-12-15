import { expect } from "@playwright/test";
import { BaseComponent } from "./base.component";

/**
 * Edit Environment Variables modal component
 * Used on project detail pages to edit environment variables for containers
 */
export class EditEnvModal extends BaseComponent {
  async openForContainer(containerName: string) {
    // Find the Edit Env button for the specific container
    const containerRow = this.page.locator('tr').filter({ hasText: containerName });
    await containerRow.getByRole("button", { name: /edit env/i }).click();
  }

  async expectLoaded() {
    // Wait for the modal to appear
    await expect(this.editEnvModal()).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText("Edit Environment Variables")).toBeVisible({ timeout: 30_000 });
  }

  editEnvModal() {
    return this.page.locator("section.fixed.inset-0.z-50").filter({ 
      has: this.page.getByText("Edit Environment Variables") 
    });
  }

  addVariableButton() {
    return this.page.getByRole("button", { name: /add variable/i });
  }

  envKeyInput(index: number) {
    return this.page.locator('input[placeholder="KEY"]').nth(index);
  }

  envValueInput(index: number) {
    return this.page.locator('input[placeholder="value"]').nth(index);
  }

  removeEnvButton(index: number) {
    // Find delete buttons (Trash2 icon buttons)
    return this.page.locator('button[aria-label="Delete variable"]').nth(index);
  }

  saveButton() {
    return this.page.getByRole("button", { name: /save changes/i });
  }

  cancelButton() {
    return this.page.getByRole("button", { name: /cancel/i });
  }

  async addEnvVariable(key: string, value: string) {
    // Click add variable button
    await this.addVariableButton().click();
    
    // Wait a moment for the inputs to appear
    await this.page.waitForTimeout(300);
    
    // Get the count of current env variables
    const keyInputs = this.page.locator('input[placeholder="KEY"]');
    const count = await keyInputs.count();
    
    // Fill the last added (newest) env variable
    await this.envKeyInput(count - 1).fill(key);
    await this.envValueInput(count - 1).fill(value);
  }

  async removeEnvVariableByIndex(index: number) {
    await this.removeEnvButton(index).click();
    await this.page.waitForTimeout(300);
  }

  async updateEnvVariable(index: number, key?: string, value?: string) {
    if (key !== undefined) {
      const keyInput = this.envKeyInput(index);
      await keyInput.clear();
      await keyInput.fill(key);
    }
    
    if (value !== undefined) {
      const valueInput = this.envValueInput(index);
      await valueInput.clear();
      await valueInput.fill(value);
    }
  }

  async getEnvVariableCount() {
    const keyInputs = this.page.locator('input[placeholder="KEY"]');
    return await keyInputs.count();
  }

  async saveChanges() {
    const saveBtn = this.saveButton();
    await expect(saveBtn).toBeEnabled({ timeout: 30_000 });
    await saveBtn.click();

    // Wait for the modal to close
    await expect(this.editEnvModal()).not.toBeVisible({ timeout: 30_000 });
  }

  async expectNoVariables() {
    await expect(this.page.getByText("No environment variables configured")).toBeVisible({ 
      timeout: 10_000 
    });
  }

  async expectVariableExists(key: string, value?: string) {
    const keyInputs = this.page.locator('input[placeholder="KEY"]');
    const count = await keyInputs.count();
    
    let found = false;
    for (let i = 0; i < count; i++) {
      const keyInputValue = await this.envKeyInput(i).inputValue();
      if (keyInputValue === key) {
        if (value !== undefined) {
          const valueInputValue = await this.envValueInput(i).inputValue();
          found = valueInputValue === value;
        } else {
          found = true;
        }
        if (found) break;
      }
    }
    
    expect(found).toBeTruthy();
  }
}
