import { test } from "../fixtures/base.fixture";
import { CallbackPage } from "../pages/public/callback.page";

test("auth: /auth/signin shows redirect screen", async ({ page }) => {
  const cb = new CallbackPage(page);
  await cb.openSignin();
  page.on("domcontentloaded", async () => {
    await cb.expectRedirectCardVisible();
  });
});

test("auth: /auth/callback shows redirect screen", async ({ page }) => {
  const cb = new CallbackPage(page);
  await cb.openCallback();
  page.on("domcontentloaded", async () => {
    await cb.expectRedirectCardVisible();
  });
});
