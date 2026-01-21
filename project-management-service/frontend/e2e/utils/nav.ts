import { BrowserContext, Locator, Page, expect } from "@playwright/test";

function alivePages(context: BrowserContext): Page[] {
  return context.pages().filter((p) => !p.isClosed());
}

async function waitForExpectedUrlOnAnyPage(
  context: BrowserContext,
  expectedUrl: RegExp,
  timeoutMs: number
): Promise<Page> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const pages = alivePages(context);

    for (const p of pages) {
      const url = p.url();

      if (url.startsWith("about:")) continue;

      if (expectedUrl.test(url)) return p;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  const urls = alivePages(context).map((p) => p.url());
  throw new Error(
    `[nav] Timed out waiting for URL ${expectedUrl}. Alive pages: ${urls.join(", ")}`
  );
}

export async function clickAndGetActivePage(
  page: Page,
  context: BrowserContext,
  clickable: Locator,
  expectedUrl: RegExp,
  timeoutMs = 30_000
): Promise<Page> {
  const pagePromise = context.waitForEvent("page").catch(() => null);

  await clickable.click();

  await pagePromise;

  const active = await waitForExpectedUrlOnAnyPage(context, expectedUrl, timeoutMs);

  await expect(active.locator("#root")).toBeVisible({ timeout: timeoutMs });

  return active;
}
