import { authTest as test, expect } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/dashboard/dashboard.page";
import { ProjectsPage } from "../pages/dashboard/projects.page";
import { TeamModal } from "../components/team-modal";
import { PendingInvitationsModal } from "../components/pending-invitations-modal";
import { generateTestString } from "../utils/strings";

test.describe("Team Collaboration - UI Access", () => {
  test("should access notification bell on projects page", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    // Notification bell should be visible
    const bellIcon = page.locator("button").filter({ has: page.locator('svg.lucide-bell') });
    await expect(bellIcon).toBeVisible({ timeout: 10_000 });
  });

  test("should open and close notifications modal", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();

    const notificationModal = new PendingInvitationsModal(page);
    
    // Open modal
    await notificationModal.open();
    
    // Modal should contain notification-related text
    await expect(
      page.getByText(/notification|invitation/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Close modal
    await notificationModal.close();
  });
});

test.describe("Team Collaboration - Project Workflow", () => {
  test("should open team modal and view team members", async ({ page }) => {
    const projectName = generateTestString("team-modal");
    
    // Create project
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await dashboard.expectLoaded();
    await dashboard.createProject(projectName, "Test viewing team members");

    // Navigate to project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();
    await projectsPage.openProject(projectName);

    // Open team modal
    const teamModal = new TeamModal(page);
    await teamModal.open();
    await teamModal.expectLoaded();

    // Verify team members section is visible
    await expect(page.getByRole("heading", { name: "Team Members" })).toBeVisible();
    
    await teamModal.close();
  });

  test("should send an invitation to a collaborator", async ({ page }) => {
    const projectName = generateTestString("team-invite");
    
    // Create project
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await dashboard.expectLoaded();
    await dashboard.createProject(projectName, "Test sending invitations");

    // Navigate to project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();
    await projectsPage.openProject(projectName);

    const teamModal = new TeamModal(page);
    await teamModal.open();
    await teamModal.expectLoaded();

    // Send invitation
    const inviteeEmail = `collaborator-${Date.now()}@example.com`;
    await teamModal.sendInvitation(inviteeEmail, "VIEWER");

    // Verify invitation appears in pending invitations section
    await teamModal.expectPendingInvitation(inviteeEmail);

    await teamModal.close();
  });

  test("should send invitations with different role types", async ({ page }) => {
    const projectName = generateTestString("team-roles");
    
    // Create project
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await dashboard.expectLoaded();
    await dashboard.createProject(projectName, "Test different role types");

    // Navigate to project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();
    await projectsPage.openProject(projectName);

    const teamModal = new TeamModal(page);
    await teamModal.open();
    await teamModal.expectLoaded();

    // Test each role type
    const roles = ["VIEWER", "DEVELOPER", "ADMIN"];
    
    for (const role of roles) {
      const email = `${role.toLowerCase()}-${Date.now()}@example.com`;
      await teamModal.sendInvitation(email, role);
      
      // Verify invitation appears with correct role badge
      await expect(page.getByText(email)).toBeVisible({ timeout: 5_000 });
      
      // Verify role badge appears (use first() to handle multiple matches)
      await expect(page.getByText(role).first()).toBeVisible();
      
      // Small delay between invitations
      await page.waitForTimeout(300);
    }

    await teamModal.close();
  });

  test("should cancel a pending invitation", async ({ page }) => {
    const projectName = generateTestString("team-cancel");
    
    // Create project
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await dashboard.expectLoaded();
    await dashboard.createProject(projectName, "Test canceling invitations");

    // Navigate to project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.open();
    await projectsPage.expectLoaded();
    await projectsPage.openProject(projectName);

    const teamModal = new TeamModal(page);
    await teamModal.open();
    await teamModal.expectLoaded();

    // Send a new invitation to cancel
    const inviteeEmail = `cancel-${Date.now()}@example.com`;
    await teamModal.sendInvitation(inviteeEmail, "DEVELOPER");
    await teamModal.expectPendingInvitation(inviteeEmail);

    // Cancel the invitation
    await teamModal.cancelInvitation(inviteeEmail);

    // Verify it's removed
    await expect(page.getByText(inviteeEmail)).not.toBeVisible({ timeout: 5_000 });

    await teamModal.close();
  });
});
