import { test, expect } from "../fixtures/base.fixture";
import { LandingPage } from "../pages/public/landing.page";
import { LegalPage } from "../pages/public/legal.page";
import { StatusPage } from "../pages/public/status.page";

test("public: landing loads", async ({ page }) => {
  const landing = new LandingPage(page);
  await landing.open();
  await landing.expectLoaded();
});

test("public: legal pages load", async ({ page }) => {
  const legal = new LegalPage(page);
  await legal.openFAQ();
  await legal.openTerms();
  await legal.openPrivacy();
  await expect(page).toHaveURL(/\/privacy$/);
});

test("public: status page loads", async ({ page }) => {
  const status = new StatusPage(page);
  await status.open();
  await status.expectLoaded();
});
