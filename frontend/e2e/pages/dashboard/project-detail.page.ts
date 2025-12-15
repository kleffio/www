import { expect, Locator } from "@playwright/test";
import { BasePage } from "../base.page";
import { expectPath } from "../../utils/wait";
import { routes } from "../../fixtures/test-data";

export class ProjectDetailPage extends BasePage {
  async open(projectId: string) {
    await this.goto(routes.dashboard.project(projectId));
  }

  async expectLoaded() {
    await this.expectAppShellLoaded();
    await expectPath(this.page, /\/dashboard\/projects\/[^/]+$/, 30_000);

    await expect(this.page.locator("#root")).toBeVisible({ timeout: 30_000 });
  }

  async expectInformation(name: string, description: string) {
    await expect(this.page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(this.page.getByText(description)).toBeVisible();
  }

  async goBackToProjects() {
    await this.page.getByRole("link", { name: /back to projects/i }).click();
  }

  // Container-related methods
  async expectRunningContainersSection() {
    await expect(this.page.getByText(/running containers/i)).toBeVisible({ timeout: 30_000 });
  }

  async expectNoContainers() {
    await expect(this.page.getByText(/no running containers/i)).toBeVisible({ timeout: 30_000 });
  }

  async expectContainerExists(containerName: string) {
    const container = this.page.getByText(containerName, { exact: true });
    await expect(container).toBeVisible({ timeout: 30_000 });
  }

  async getContainerCount() {
    const containers = this.page.locator('[data-container-name], [data-testid="container-row"]');
    return await containers.count();
  }

  // Metrics-related methods
  metricsSection(): Locator {
    return this.page.getByText("Project Metrics & Billing");
  }

  monthlyCostCard(): Locator {
    return this.page.getByText("Estimated Monthly Cost");
  }

  cpuUsageCard(): Locator {
    return this.page.getByText("Total CPU Usage");
  }

  memoryCard(): Locator {
    return this.page.getByText("Total Memory");
  }

  containerStatusCard(): Locator {
    return this.page.getByText("Container Status");
  }

  async expectMetricsVisible() {
    await expect(this.metricsSection()).toBeVisible({ timeout: 10_000 });
  }

  async expectMetricsNotVisible() {
    await expect(this.metricsSection()).not.toBeVisible({ timeout: 5_000 });
  }

  async expectAllMetricCardsVisible() {
    await expect(this.monthlyCostCard()).toBeVisible();
    await expect(this.cpuUsageCard()).toBeVisible();
    await expect(this.memoryCard()).toBeVisible();
    await expect(this.containerStatusCard()).toBeVisible();
  }

  async expectMetricsLoaded() {
    await this.expectMetricsVisible();
    await this.expectAllMetricCardsVisible();
    
    // Verify cards contain proper units
    const costCard = this.monthlyCostCard().locator("..");
    const cpuCard = this.cpuUsageCard().locator("..");
    const memCard = this.memoryCard().locator("..");
    
    await expect(costCard).toContainText("$");
    await expect(cpuCard).toContainText("cores");
    await expect(memCard).toContainText("GB");
  }

  async expectMetricsBetweenSections() {
    const projectOverview = this.page.getByText("Project Overview");
    const metricsSection = this.metricsSection();
    const runningContainers = this.page.getByText("Running Containers");

    await expect(projectOverview).toBeVisible();
    await expect(metricsSection).toBeVisible();
    await expect(runningContainers).toBeVisible();

    const overviewBox = await projectOverview.boundingBox();
    const metricsBox = await metricsSection.boundingBox();
    const containersBox = await runningContainers.boundingBox();

    if (overviewBox && metricsBox && containersBox) {
      expect(metricsBox.y).toBeGreaterThan(overviewBox.y);
      expect(metricsBox.y).toBeLessThan(containersBox.y);
    }
  }

  async expectContainerCountInMetrics(count: number) {
    const statusCard = this.containerStatusCard().locator("..");
    await expect(statusCard).toContainText(`${count}`);
    await expect(statusCard).toContainText("running");
  }
}