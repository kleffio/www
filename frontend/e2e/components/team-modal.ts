import { expect } from "@playwright/test";
import { BaseComponent } from "./base.component";

/**
 * Team modal component
 * Used to manage team members and send invitations
 */
export class TeamModal extends BaseComponent {
  /**
   * Opens the team modal from the project detail page
   */
  async open() {
    await this.page.getByRole("button", { name: /^team$/i }).click();
    await expect(this.modal()).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Main modal container
   */
  modal() {
    return this.page.locator("div.fixed.inset-0").filter({ hasText: "Team Management" });
  }

  /**
   * Wait for modal to be loaded
   */
  async expectLoaded() {
    await expect(this.modal()).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByRole("heading", { name: "Team Management" })).toBeVisible();
  }

  /**
   * Click the invite member button
   */
  async clickInviteButton() {
    await this.page.getByRole("button", { name: /invite member/i }).click();
    await expect(this.inviteModal()).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Invite modal (appears after clicking invite button)
   */
  inviteModal() {
    return this.page.locator("div.fixed.inset-0").filter({ hasText: "Invite Collaborator" });
  }

  /**
   * Send an invitation to a collaborator
   */
  async sendInvitation(email: string, role: string = "VIEWER") {
    await this.clickInviteButton();

    // Fill in email
    const emailInput = this.page.locator("#email");
    await emailInput.fill(email);

    // Open the role select dropdown and choose role
    const selectTrigger = this.page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    
    // Wait for dropdown to open and click the role option
    await this.page.waitForTimeout(300);
    const roleOption = this.page.locator(`[role="option"]`).filter({ hasText: role }).first();
    await roleOption.click();

    // Find the submit button within the modal and click it
    const submitButton = this.inviteModal().locator("button[type='submit']").or(
      this.inviteModal().getByRole("button", { name: /invite/i })
    );
    await submitButton.click();

    // Wait a bit for the invitation to be processed
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if a collaborator appears in the team members table
   */
  async expectCollaborator(email: string) {
    await expect(this.page.getByText(email)).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Check if an invitation appears in the pending invitations section
   */
  async expectPendingInvitation(email: string) {
    // Scroll to pending invitations section
    await this.page.getByText("Pending Invitations").scrollIntoViewIfNeeded();
    
    // Check if email appears in the table
    await expect(this.page.getByText(email)).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Cancel/delete an invitation
   */
  async cancelInvitation(email: string) {
    // Find the row with the email
    const row = this.page.locator("tr").filter({ hasText: email });
    
    // Click the delete button in that row
    await row.locator("button").filter({ has: this.page.locator('svg.lucide-trash-2') }).click();

    // Wait for it to disappear
    await expect(row).not.toBeVisible({ timeout: 10_000 });
  }

  /**
   * Remove a collaborator from the project
   */
  async removeCollaborator(email: string) {
    // Find the row with the email in Team Members section
    const teamMembersSection = this.page.locator("text=Team Members").locator("..");
    const row = teamMembersSection.locator("tr").filter({ hasText: email });
    
    // Click the remove button (trash icon)
    await row.locator("button").filter({ has: this.page.locator('svg.lucide-trash-2') }).click();

    // Wait for it to disappear
    await expect(row).not.toBeVisible({ timeout: 10_000 });
  }

  /**
   * Update a collaborator's role
   */
  async updateCollaboratorRole(email: string, newRole: string) {
    // Find the row with the email
    const row = this.page.locator("tr").filter({ hasText: email });
    
    // Click the edit button
    await row.locator("button").filter({ has: this.page.locator('svg.lucide-edit-2') }).click();

    // Select new role in the dropdown
    const roleSelect = row.locator("select");
    await roleSelect.selectOption(newRole);

    // Save changes (might need to click a save button or it might auto-save)
    // Based on the component code, clicking edit likely opens an edit mode
    // We'll need to verify this works
  }

  /**
   * Close the modal
   */
  async close() {
    await this.page.locator("button").filter({ has: this.page.locator('svg.lucide-x') }).first().click();
    await expect(this.modal()).not.toBeVisible({ timeout: 10_000 });
  }
}
