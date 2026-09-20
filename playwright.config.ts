import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: process.env.TEST_BASE_URL ? 90000 : 45000,
  expect: { timeout: process.env.TEST_BASE_URL ? 15000 : 5000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
});
