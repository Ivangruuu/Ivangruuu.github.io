import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  use: {
    browserName: "webkit",
    baseURL: "http://127.0.0.1:8011",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  },
  webServer: {
    command: "python3 -m http.server 8011 --bind 127.0.0.1 --directory dist",
    url: "http://127.0.0.1:8011",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
