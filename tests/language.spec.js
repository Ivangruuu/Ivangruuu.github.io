import { test, expect } from "@playwright/test";

test("Russian is the default and the header switches both ways", async ({
  page,
}) => {
  const errors = [];
  const missing = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:8011") &&
      response.status() >= 400
    )
      missing.push(response.url());
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(
    page.locator('.language-switch [aria-current="page"]'),
  ).toHaveText("RU");
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Ivan Gruzdev - ML Engineer");
  await expect(
    page.locator('.language-switch [aria-current="page"]'),
  ).toHaveText("EN");
  await expect(page.locator("#nlp-case-title")).toHaveText("Text analysis");
  await expect(page.locator("#language-case-title")).toHaveText(
    "Conversational event analytics",
  );
  await expect(page.locator("#cv-case-line .video-toggle")).toHaveAttribute(
    "aria-label",
    "Play video: Counting products on a conveyor belt",
  );
  await expect(page.locator("#cv-case-line .video-expand")).toHaveAttribute(
    "aria-label",
    "Expand video: Counting products on a conveyor belt",
  );
  expect(await page.locator("body").innerText()).not.toMatch(/[А-Яа-яЁё]/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "RU", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("#nlp-case-title")).toHaveText("Анализ текстов");
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`English layout and locale switch fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en.html");
    await expect(page.locator(".language-switch")).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const links = page.locator(".language-switch a");
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    if (width <= 760) {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await expect(page.locator(".nav")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Close menu", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".nav")).not.toBeVisible();
    }
    await page.screenshot({ path: `test-results/english-${width}.png` });
  });
}

test("English translation and language switch work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8011/en.html");
  await expect(page.locator("#nlp-case-title")).toHaveText("Text analysis");
  await expect(page.getByRole("link", { name: "Open video ↗" })).toHaveCount(
    4,
  );
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "RU", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await context.close();
});

test("English video controls play, pause and restore an expanded video", async ({
  page,
}) => {
  await page.goto("/en.html");
  const clip = page.locator("#cv-case-line");
  const video = clip.locator("video");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("src", /cv-original-51\.mp4$/);
  await expect
    .poll(
      () =>
        video.evaluate(
          (v) => v.readyState >= 2 && v.videoWidth > 0 && !v.error,
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  // Wait for lazy decoding and establish a paused baseline before the click;
  // viewport autoplay may have started while Playwright scrolled to the clip.
  if (!(await video.evaluate((v) => v.paused))) {
    await clip
      .getByRole("button", {
        name: "Pause video: Counting products on a conveyor belt",
        exact: true,
      })
      .click();
  }
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await clip
    .getByRole("button", {
      name: "Play video: Counting products on a conveyor belt",
      exact: true,
    })
    .click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await clip
    .getByRole("button", {
      name: "Pause video: Counting products on a conveyor belt",
      exact: true,
    })
    .click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await clip
    .getByRole("button", {
      name: "Expand video: Counting products on a conveyor belt",
    })
    .click();
  await expect(page.locator("#video-screen-title")).toHaveText(
    "Counting products on a conveyor belt",
  );
  await page.getByRole("button", { name: "Close fullscreen video" }).click();
  await expect(clip.locator("video")).toHaveCount(1);
});
