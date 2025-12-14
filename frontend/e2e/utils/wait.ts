import { expect, Page } from "@playwright/test";

export async function expectPath(page: Page, pathOrRegex: string | RegExp, timeout = 15_000) {
  if (typeof pathOrRegex === "string") {
    const escaped = pathOrRegex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await expect(page).toHaveURL(new RegExp(escaped + "$"), { timeout });
    return;
  }
  await expect(page).toHaveURL(pathOrRegex, { timeout });
}
