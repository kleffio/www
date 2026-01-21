import { Page, BrowserContext, expect } from "@playwright/test";

export async function clickAndStayOnApp(
  page: Page,
  context: BrowserContext,
  locator: ReturnType<Page["locator"]>,
  expectedUrl: RegExp
) {
  const newPagePromise = context.waitForEvent("page").catch(() => null);

  await locator.click();

  const newPage = await newPagePromise;

  const active = newPage ?? page;

  if (active.url().startsWith("about:")) {
    await active.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => {});
  }

  await expect(active).toHaveURL(expectedUrl, { timeout: 30_000 });
  return active;
}
