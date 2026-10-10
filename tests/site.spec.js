import { test, expect } from "@playwright/test";

test("static content and mobile navigation are usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8011");
  for (const id of [
    "experience",
    "vision",
    "language",
    "multimodal",
    "ocr",
    "nlp",
    "contact",
  ]) {
    await expect(page.locator("#" + id)).toBeVisible();
  }
  await expect(page.locator(".nav")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Открыть видео ↗" }),
  ).toHaveCount(4);
  await page.screenshot({
    path: "test-results/no-js-mobile.png",
    fullPage: true,
  });
  await context.close();
});

test("initial load does not fetch video files and has no runtime errors", async ({
  page,
}) => {
  const errors = [];
  const videos = [];
  const missing = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/\.mp4(?:\?|$)/.test(request.url())) videos.push(request.url());
  });
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:8011") &&
      response.status() >= 400
    )
      missing.push(response.url());
  });
  await page.goto("/");
  await expect(page.locator("#nlp-case-title")).toHaveText("Анализ текстов");
  expect(await page.locator("video[src]").count()).toBe(0);
  expect(videos).toEqual([]);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
  await expect(page.locator(".toast")).toHaveAttribute("role", "status");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /social-preview\.jpg$/,
  );
});

test("video loads near viewport, plays, pauses, expands and returns", async ({
  page,
}) => {
  await page.goto("/");
  const clip = page.locator("#cv-case-line");
  const video = clip.locator("video");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("src", /cv-original-51\.mp4$/);
  if (!(await video.evaluate((v) => v.paused))) {
    await clip
      .getByRole("button", {
        name: "Остановить видео: Подсчёт продукции на конвейере",
        exact: true,
      })
      .click();
  }
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  const play = clip.getByRole("button", {
    name: "Воспроизвести видео: Подсчёт продукции на конвейере",
    exact: true,
  });
  await play.click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await clip
    .getByRole("button", {
      name: "Остановить видео: Подсчёт продукции на конвейере",
      exact: true,
    })
    .click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await clip
    .getByRole("button", {
      name: "Увеличить видео: Подсчёт продукции на конвейере",
    })
    .click();
  await expect(page.locator("#video-dialog")).toBeVisible();
  await expect(page.locator("#video-dialog video")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Закрыть полноэкранное видео" })
    .click();
  await expect(page.locator("#video-dialog")).not.toBeVisible();
  await expect(clip.locator("video")).toHaveCount(1);
});

test("autoplay stops offscreen and respects an explicit pause", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const clip = page.locator("#cv-case-line");
  const video = clip.locator("video");
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await page.locator("#hero-title").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await clip
    .getByRole("button", {
      name: "Остановить видео: Подсчёт продукции на конвейере",
      exact: true,
    })
    .click();
  await page.locator("#hero-title").scrollIntoViewIfNeeded();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
});

for (const width of [390, 768, 1440])
  test(`layout fits ${width}px and images load`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#nlp");
    await page.locator("#nlp").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator("#nlp img")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `test-results/nlp-${width}.png` });
    if (width === 390) {
      await page.locator(".menu-toggle").click();
      await expect(page.locator(".nav")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".nav")).not.toBeVisible();
    }
  });

test("background failure does not prevent content or video controls", async ({
  page,
}) => {
  await page.route("**/animation.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#nlp")).toBeVisible();
  await expect(page.locator(".video-expand")).toHaveCount(4);
});

test("all four video files decode", async ({ page }) => {
  await page.goto("/");
  for (const id of [
    "cv-case-line",
    "cv-case-roi",
    "cv-case-pose",
    "multimodal",
  ]) {
    const video = page.locator(`#${id} video`);
    await video.scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("src", /\.mp4$/);
    await expect
      .poll(() =>
        video.evaluate(
          (v) => v.readyState >= 2 && v.videoWidth > 0 && !v.error,
        ),
      )
      .toBe(true);
  }
});
