import { expect } from "@playwright/test";
import { BaseComponent } from "./base.component";

/**
 * Pending Invitations Modal component
 * Accessible from the notification bell icon on the projects page
 */
export class PendingInvitationsModal extends BaseComponent {
  /**
   * Opens the pending invitations modal by clicking the notification bell
   */
  async open() {
    // Click the bell icon
    const bellButton = this.page.locator("button").filter({ has: this.page.locator('svg.lucide-bell') });
    await bellButton.click();
    
    // Wait for modal to appear
    await expect(this.modal()).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Main modal container
   */
  modal() {
    return this.page.locator("div.fixed.inset-0").filter({ hasText: /notifications|invitations/i });
  }

  /**
   * Get the notification badge count
   */
  async getInvitationCount(): Promise<number> {
    const badge = this.page.locator("button").filter({ has: this.page.locator('svg.lucide-bell') }).locator("span");
    
    if (await badge.isVisible().catch(() => false)) {
      const text = await badge.textContent();
      if (text === "9+") return 9;
      return parseInt(text || "0", 10);
    }
    
    return 0;
  }

  /**
   * Verify the invitation count badge shows the expected number
   */
  async expectInvitationCount(count: number) {
    if (count === 0) {
      // Badge should not be visible
      const badge = this.page.locator("button").filter({ has: this.page.locator('svg.lucide-bell') }).locator("span");
      await expect(badge).not.toBeVisible();
    } else {
      const actualCount = await this.getInvitationCount();
      expect(actualCount).toBe(count);
    }
  }

  /**
   * Check if an invitation is present for a specific project
   */
  async expectInvitation(projectName: string) {
    await expect(this.modal()).toBeVisible();
    await expect(this.page.getByText(projectName)).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Accept an invitation for a project
   */
  async acceptInvitation(projectName: string) {
    const row = this.page.locator(".pending-invitation-item, tr").filter({ hasText: projectName });
    
    // Click accept button
    const acceptButton = row.locator("button").filter({ hasText: /accept/i }).or(
      row.locator("button").filter({ has: this.page.locator('svg.lucide-check') })
    );
    
    await acceptButton.click();
    
    // Wait for success message or invitation to disappear
    await this.page.waitForTimeout(2000);
  }

  /**
   * Reject an invitation for a project
   */
  async rejectInvitation(projectName: string) {
    const row = this.page.locator(".pending-invitation-item, tr").filter({ hasText: projectName });
    
    // Click reject/decline button
    const rejectButton = row.locator("button").filter({ hasText: /reject|decline/i }).or(
      row.locator("button").filter({ has: this.page.locator('svg.lucide-x') })
    );
    
    await rejectButton.click();
    
    // Wait for invitation to disappear
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify there are no invitations
   */
  async expectNoInvitations() {
    await expect(this.modal()).toBeVisible();
    await expect(this.page.getByText(/no.*invitation|no new notification/i)).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Close the modal
   */
  async close() {
    const closeButton = this.page.locator("button").filter({ has: this.page.locator('svg.lucide-x') }).first();
    await closeButton.click();
    await expect(this.modal()).not.toBeVisible({ timeout: 10_000 });
  }
}
