import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import type { Project } from "../../lib/domain";
const prepared = JSON.parse(
  readFileSync("content/sample/companion.json", "utf8"),
);

test("real Fable composition through timed video import persists its recording", async ({
  page,
}) => {
  test.skip(
    process.env.WATCHREAD_LIVE_TEST !== "1",
    "Requires the configured live model; no mock provider.",
  );
  test.setTimeout(300000);
  await page.goto("/app/new");
  await page
    .getByRole("textbox", { name: "Companion title" })
    .fill("Where a tree gets its carbon");
  await page.locator('input[accept=".vtt,.srt,.txt"]').setInputFiles({
    name: "carbon-excerpt.vtt",
    mimeType: "text/vtt",
    buffer: Buffer.from(
      readFileSync("public/sample/transcript.vtt", "utf8")
        .split(/\n\s*\n/)
        .slice(0, 6)
        .join("\n\n"),
    ),
  });
  await page
    .locator('input[accept="video/mp4,video/webm,.mp4,.webm"]')
    .setInputFiles("public/sample/lecture.mp4");
  const start = Date.now();
  await page.getByRole("button", { name: "Compose my companion" }).click();
  await Promise.race([
    expect(page).toHaveURL(/\/app\/[^/]+\/read/, { timeout: 240000 }),
    page
      .locator('.error-notice[role="alert"]')
      .waitFor({ state: "visible", timeout: 240000 })
      .then(async () => {
        throw Error(
          await page.locator('.error-notice[role="alert"]').innerText(),
        );
      }),
  ]);
  await expect(page.locator(".book-prose")).toBeVisible();
  const projectId = new URL(page.url()).pathname.split("/")[2];
  const project = await page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("watchread", 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return await new Promise<Project>((resolve, reject) => {
      const req = db.transaction("projects").objectStore("projects").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }, projectId);
  expect(project.sourceType).toBe("upload");
  expect(project.run!.model).toBe("claude-fable-5-1");
  expect(project.run!.id).not.toBe(prepared.run.id);
  expect(project.run!.promptVersion).toBe("watchread-2");
  expect(project.cues.length).toBe(5);
  expect(project.media!.sampleUrl).toBeUndefined();
  expect(JSON.stringify(project.companion)).not.toBe(
    JSON.stringify(prepared.companion),
  );
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThan(0);
  expect(await page.locator("video").getAttribute("src")).toMatch(/^blob:/);
  await page.reload();
  await expect(page.locator(".book-prose")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThan(0);
  await page.locator(".citation-chip").first().click();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => !v.paused),
    )
    .toBe(true);
  mkdirSync("evals/browser", { recursive: true });
  writeFileSync(
    "evals/browser/live-import.json",
    JSON.stringify(
      {
        project,
        wallMs: Date.now() - start,
        observed: [
          "real timed import",
          "real model pipeline",
          "distinct generated result",
          "IndexedDB video persistence",
          "reload",
          "citation playback",
        ],
      },
      null,
      2,
    ),
  );
});

test("real generation cancellation preserves its saved source and releases the model job", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.WATCHREAD_LIVE_TEST !== "1",
    "Requires the configured live model; no mock provider.",
  );
  test.setTimeout(60000);
  await page.goto("/app/new");
  await page
    .getByRole("textbox", { name: "Companion title" })
    .fill("Cancellation verification");
  await page
    .locator('input[accept=".vtt,.srt,.txt"]')
    .setInputFiles("public/sample/transcript.vtt");
  await page.getByRole("button", { name: "Compose my companion" }).click();
  await expect(
    page.getByText("Composing chapters", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".error-notice")).toContainText(
    "Composition cancelled",
  );
  await page.getByRole("link", { name: "Open saved source" }).click();
  await expect(
    page.getByRole("heading", { name: /Let's give it/ }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".transcript-cue")).toHaveCount(16);
  await expect
    .poll(
      async () => {
        const r = await request.post("/api/generate", {
          headers: { Origin: "http://127.0.0.1:3000" },
          data: { title: "Validation only", cues: [] },
        });
        return r.status();
      },
      { timeout: 10000 },
    )
    .toBe(400);
  mkdirSync("evals/browser", { recursive: true });
  writeFileSync(
    "evals/browser/cancellation.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        passed: true,
        observed: [
          "real model job started",
          "browser cancelled request",
          "saved source opened and reloaded",
          "endpoint released concurrency lease",
        ],
      },
      null,
      2,
    ),
  );
});
