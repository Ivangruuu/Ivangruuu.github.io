import { test, expect } from "@playwright/test";

test.use({ browserName: "chromium", reducedMotion: "reduce" });
test("does not start videos automatically", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const video = page.locator("#cv-case-line video");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("src", /cv-original-51/);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
});
