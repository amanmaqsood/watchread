import { test, expect } from "@playwright/test";
test("complete source and recovery journey survives reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open the sample" }).click();
  await expect(
    page.getByRole("heading", { name: "A tree is made of air" }),
  ).toBeVisible();
  const citations = page.locator(".citation-chip");
  await citations.nth(1).click();
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(20);
  await expect(page.locator(".selected-source")).toContainText(
    "Carbon dioxide and water",
  );
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused))
    .toBe(true);
  const before = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(before + 0.1);
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await page
    .getByRole("button", { name: "A Minerals absorbed from the soil" })
    .click();
  await expect(
    page.getByRole("heading", { name: "A useful thing to untangle." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Revisit the explanation/ }).click();
  await expect(page.getByText("Source opened", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try a different question" }).click();
  await page
    .getByRole("button", {
      name: "A Carbon atoms taken in as carbon dioxide",
    })
    .click();
  await expect(
    page.getByText("New answer correct", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 attempts saved on this device")).toBeVisible();
  await page.getByRole("link", { name: "Read", exact: true }).click();
  await page.getByRole("button", { name: "Edit chapter outline" }).click();
  const input = page.getByRole("textbox", { name: "Chapter 1 title" });
  await input.fill("Air becomes a tree");
  await page.getByRole("button", { name: "Back to reading" }).click();
  await expect(
    page.getByRole("heading", { name: "Air becomes a tree" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Air becomes a tree" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Export", exact: true }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: /The manuscript/ }).click();
  const file = await event;
  expect(file.suggestedFilename()).toBe("manuscript.md");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.frameLocator("iframe").getByRole("heading", {
      name: "How photosynthesis actually works",
      exact: true,
    }),
  ).toBeVisible();
});
test("mobile reader is usable and opens actual source", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/photosynthesis/read");
  await expect(
    page.getByRole("heading", { name: "A tree is made of air" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".citation-chip").first().click();
  await expect(page.locator(".source-container.mobile-open")).toBeVisible();
  await expect(page.locator("video")).toBeVisible();
  await page.getByRole("button", { name: "Close source player" }).click();
  await expect(page.locator(".source-container.mobile-open")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/mobile-reader.png",
    fullPage: true,
  });
});
test("untimed transcript import preserves an honest saved draft when generation is unavailable", async ({
  page,
}) => {
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: { available: false, provider: "Not configured", model: "" },
    }),
  );
  await page.goto("/app/new");
  await page.locator('input[accept=".vtt,.srt,.txt"]').setInputFiles({
    name: "new-lesson.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      "A new untimed lecture.\nThe source has no timestamps.",
    ),
  });
  await page.getByRole("button", { name: "Save my source" }).click();
  await expect(
    page.getByRole("heading", { name: /Let's give it/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Let's give it/ }),
  ).toBeVisible();
});
