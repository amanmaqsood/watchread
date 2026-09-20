import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const unavailable = async (page: import("@playwright/test").Page) =>
  page.route("**/api/status", (r) =>
    r.fulfill({
      json: { available: false, provider: "Not configured", model: "" },
    }),
  );

test("all exports reopen and portable project reconnects the exact original media", async ({
  page,
}) => {
  await page.goto("/app/photosynthesis/export");
  for (const [name, filename] of [
    ["The manuscript", "manuscript.md"],
    ["The reading copy", "reading-copy.html"],
    ["The source index", "citations.csv"],
    ["The whole companion", "watchread-project.json"],
  ]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: new RegExp(name) }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toBe(filename);
    const content = await readFile((await file.path())!, "utf8");
    expect(content).toContain("cue-1");
    if (filename.endsWith(".html")) {
      const copy = await page.context().newPage();
      await copy.setContent(content);
      await expect(
        copy.getByRole("heading", { name: "Glossary" }),
      ).toBeVisible();
      expect(await copy.locator("script").count()).toBe(0);
      await copy.close();
    }
    if (filename.endsWith(".csv"))
      expect(content).toContain('"source_revision"');
    if (filename.endsWith(".json")) {
      const project = JSON.parse(content);
      expect(project.run.model).toBe("claude-fable-5-1");
      await page.goto("/app/new");
      await page.locator('input[accept=".json"]').setInputFiles({
        name: filename,
        mimeType: "application/json",
        buffer: Buffer.from(content),
      });
      await expect(page).toHaveURL(/\/app\/import-.+\/read/);
      await expect(
        page.getByRole("heading", { name: "Reconnect your recording" }),
      ).toBeVisible();
      await page.locator('input[accept=".mp4,.webm"]').setInputFiles({
        name: "unrelated.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.from("This is not the original recording."),
      });
      await expect(page.locator(".studio-error[role=alert]")).toContainText(
        "different recording",
      );
      await page
        .locator('input[accept=".mp4,.webm"]')
        .setInputFiles("public/sample/lecture.mp4");
      await expect(page.locator("video")).toBeVisible();
      await page.reload();
      await expect
        .poll(() =>
          page.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
        )
        .toBeGreaterThan(0);
    }
  }
});

test("source replacement disables old evidence and practice, then restores prior source and run", async ({
  page,
}) => {
  await page.goto("/app/photosynthesis/sources");
  await expect(page.getByText(/Generated with claude-fable-5-1/)).toBeVisible();
  await page.locator('input[accept=".srt,.vtt,.txt"]').setInputFiles({
    name: "replacement.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("A replacement lesson about a different subject."),
  });
  await expect(page.locator(".revision-notice")).toContainText(
    "The transcript changed",
  );
  await expect(page.locator(".evidence-row button").first()).toBeDisabled();
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A little more source review first." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A little more source review first." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sources", exact: true }).click();
  await page
    .getByRole("button", { name: "Restore previous source and companion" })
    .click();
  await expect(page.locator(".revision-notice")).toHaveCount(0);
  await expect(page.getByText(/Generated with claude-fable-5-1/)).toBeVisible();
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "A Minerals absorbed from the soil" }),
  ).toBeEnabled();
});

test("sample is usable without external services and clip seeks exactly and stops at its end", async ({
  page,
}) => {
  const external: string[] = [];
  const appOrigin = new URL(
    process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
  ).origin;
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("http") && new URL(url).origin !== appOrigin) {
      external.push(url);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/app/photosynthesis/read");
  await page.locator(".citation-chip").nth(1).click();
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused))
    .toBe(true);
  const cues = JSON.parse(await readFile("content/sample/cues.json", "utf8"));
  const target = cues[1];
  const current = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  expect(Math.abs(current - target.start)).toBeLessThan(1);
  await video.evaluate((v: HTMLVideoElement, end: number) => {
    v.currentTime = end - 0.2;
  }, target.end);
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  expect(external).toEqual([]);
});

test("keyboard dialogs trap and restore focus; chapter edits keep typed shortcuts literal", async ({
  page,
}) => {
  await page.goto("/app/photosynthesis/read");
  const trigger = page.getByRole("button", { name: "Edit chapter outline" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Chapter outline" });
  await expect(dialog).toBeVisible();
  const input = page.getByRole("textbox", { name: "Chapter 1 title" });
  await input.fill("n p ? are letters");
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Back to reading" }).focus();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "n p ? are letters" }),
  ).toBeVisible();
});

test("video-only imports remain a saved draft awaiting a transcript", async ({
  page,
}) => {
  await unavailable(page);
  await page.goto("/app/new");
  await page
    .locator('input[accept="video/mp4,video/webm,.mp4,.webm"]')
    .setInputFiles("public/sample/lecture.mp4");
  await page.getByRole("button", { name: "Save my source" }).click();
  await expect(
    page.getByRole("heading", { name: /Let's give it/ }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("video")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Let's give it/ }),
  ).toBeVisible();
});

test("a media quota failure preserves transcript and gives an honest reconnect flow", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === "media")
        throw new DOMException("Simulated storage limit", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  await unavailable(page);
  await page.goto("/app/new");
  await page
    .locator('input[accept=".vtt,.srt,.txt"]')
    .setInputFiles("public/sample/transcript.vtt");
  await page
    .locator('input[accept="video/mp4,video/webm,.mp4,.webm"]')
    .setInputFiles("public/sample/lecture.mp4");
  await page.getByRole("button", { name: "Save my source" }).click();
  await expect(
    page.getByRole("heading", { name: "Reconnect your recording" }),
  ).toBeVisible();
  await expect(page.locator(".transcript-cue")).toHaveCount(16);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Reconnect your recording" }),
  ).toBeVisible();
});

test("sample stays readable when all browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = function () {
      throw new DOMException("Simulated denied storage", "SecurityError");
    };
  });
  await page.goto("/app/photosynthesis/read");
  await expect(
    page.getByRole("heading", { name: "A tree is made of air" }),
  ).toBeVisible();
  await expect(page.getByText("Not saved", { exact: true })).toBeVisible();
  await page.locator(".citation-chip").first().click();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => !v.paused),
    )
    .toBe(true);
});

test("noncontiguous passages stay separate and later references scroll into view", async ({
  page,
}) => {
  await page.goto("/app/photosynthesis/read");
  await page.locator(".citation-chip").first().click();
  await page.getByRole("button", { name: /Passage 2/ }).click();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(100);
  await page
    .getByRole("combobox", { name: "Choose chapter" })
    .selectOption("2");
  await page.locator(".citation-chip").nth(2).click();
  await expect(page.locator(".selected-source")).toContainText(
    "light-independent",
  );
  await expect
    .poll(() => page.locator(".transcript-list").evaluate((e) => e.scrollTop))
    .toBeGreaterThan(500);
  await expect
    .poll(() =>
      page
        .locator(".transcript-cue.selected")
        .first()
        .evaluate((e) => {
          const r = e.getBoundingClientRect();
          const p = e.parentElement!.getBoundingClientRect();
          return r.top >= p.top && r.top < p.bottom;
        }),
    )
    .toBe(true);
});
