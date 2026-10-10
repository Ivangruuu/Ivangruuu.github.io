import { test, expect } from "@playwright/test";

test.use({ browserName: "chromium" });
test.describe.configure({ mode: "default" });
const waitFrames = (page, count = 45) =>
  page.evaluate(
    (count) =>
      new Promise((resolve) => {
        let frames = 0;
        const tick = () =>
          ++frames >= count ? resolve() : requestAnimationFrame(tick);
        requestAnimationFrame(tick);
      }),
    count,
  );
async function observeBackground(page) {
  await page.addInitScript(() => {
    window.backgroundProbe = { frames: 0, radius: 0 };
    window.backgroundProbe.media = matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    window.backgroundProbe.changes = [];
    window.backgroundProbe.media.addEventListener("change", (event) =>
      window.backgroundProbe.changes.push(event.matches),
    );
    const prototype = CanvasRenderingContext2D.prototype;
    const clear = prototype.clearRect,
      ellipse = prototype.ellipse;
    prototype.clearRect = function (...args) {
      if (this.canvas.id === "neural") window.backgroundProbe.frames++;
      return clear.apply(this, args);
    };
    prototype.ellipse = function (...args) {
      if (this.canvas.id === "neural") window.backgroundProbe.radius = args[2];
      return ellipse.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
}
const canvasTint = (page) =>
  page.locator("#neural").evaluate((canvas) => {
    const data = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let red = 0,
      blue = 0;
    for (let i = 0; i < data.length; i += 64) {
      red += data[i] * data[i + 3];
      blue += data[i + 2] * data[i + 3];
    }
    return { red, blue };
  });
const canvasMargins = (page) =>
  page.locator("#neural").evaluate((canvas) => {
    const { width, height } = canvas;
    const data = canvas.getContext("2d").getImageData(0, 0, width, height).data;
    let left = 0,
      right = 0;
    const margin = Math.floor(width * 0.04);
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < margin; x += 4) {
        if (data[(y * width + x) * 4 + 3] > 32) left++;
        if (data[(y * width + width - 1 - x) * 4 + 3] > 32) right++;
      }
    }
    return { left, right };
  });
test("background responds to section scroll without breaking page", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.text().includes("Background animation unavailable")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect
    .poll(async () => {
      const { red, blue } = await canvasTint(page);
      return { green: red > blue, painted: blue > 0, errors };
    })
    .toEqual({ green: true, painted: true, errors: [] });
  await page.screenshot({ path: "test-results/background-hero.png" });
  // CV uses the default green palette but must still expand to both margins.
  await page.locator("#vision").scrollIntoViewIfNeeded();
  await expect
    .poll(async () => {
      const { left, right } = await canvasMargins(page);
      return left > 10 && right > 10;
    })
    .toBe(true);
  await page.locator("#language").scrollIntoViewIfNeeded();
  await expect
    .poll(async () => {
      const { red, blue } = await canvasTint(page);
      return blue > red;
    })
    .toBe(true);
  await page.screenshot({ path: "test-results/background-llm.png" });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect
    .poll(async () => {
      const { left, right } = await canvasMargins(page);
      return left < 5 && right < 5;
    })
    .toBe(true);
  expect(errors).toEqual([]);
});
test("reduced motion keeps the background still while scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator("#neural");
  const before = await canvas.evaluate((c) => c.toDataURL());
  await page.locator("#language").scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        function next() {
          if (++frames === 8) resolve();
          else requestAnimationFrame(next);
        }
        requestAnimationFrame(next);
      }),
  );
  expect(await canvas.evaluate((c) => c.toDataURL())).toBe(before);
});

test("sphere grows through experience and shrinks after the OCR bottom edge", async ({
  page,
}) => {
  await observeBackground(page);
  const positions = await page.evaluate(() => {
    const midpoint = (id) => {
      const rect = document.getElementById(id).getBoundingClientRect();
      return rect.top + scrollY + rect.height / 2 - innerHeight / 2;
    };
    return {
      experience: midpoint("experience"),
      ocr:
        document.getElementById("ocr").getBoundingClientRect().bottom +
        scrollY -
        innerHeight / 2,
    };
  });
  const sample = async (top) => {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      top,
    );
    await waitFrames(page, 60);
    return page.evaluate(() => window.backgroundProbe.radius);
  };
  const before = await sample(positions.experience - 100);
  const growing = await sample(positions.experience + 600);
  const large = await sample(positions.ocr);
  const shrinking = await sample(positions.ocr + 700);
  expect(growing).toBeGreaterThan(before * 1.1);
  expect(growing).toBeLessThan(large * 0.9);
  expect(shrinking).toBeLessThan(large * 0.95);
  expect(shrinking).toBeGreaterThan(before * 1.1);
});

test("background resumes once after visibility, resize and motion preference changes", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.text().includes("Background animation unavailable"))
      errors.push(message.text());
  });
  await observeBackground(page);
  const frames = () => page.evaluate(() => window.backgroundProbe.frames);
  await expect
    .poll(async () => ({ running: (await frames()) > 3, errors }))
    .toEqual({ running: true, errors: [] });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const paused = await frames();
  await waitFrames(page, 12);
  expect(await frames()).toBe(paused);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    for (let i = 0; i < 3; i++)
      document.dispatchEvent(new Event("visibilitychange"));
  });
  await waitFrames(page, 12);
  expect(await frames()).toBeGreaterThan(paused);
  expect(await frames()).toBeLessThanOrEqual(paused + 13);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.locator("#neural").evaluate((canvas) => canvas.width))
    .toBe(390);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect
    .poll(() => page.locator("#neural").evaluate((canvas) => canvas.width))
    .toBe(1440);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.backgroundProbe.changes))
    .toContain(true);
  await waitFrames(page, 3);
  const still = await frames();
  await waitFrames(page, 12);
  expect(await frames()).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(frames).toBeGreaterThan(still + 3);
  expect(errors).toEqual([]);
});
