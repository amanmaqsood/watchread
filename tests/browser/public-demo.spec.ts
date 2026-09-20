import { test, expect } from "@playwright/test";

test("first-use tour leads to a complete second prepared lesson", async ({
  page,
}) => {
  await page.goto("/guide");
  await expect(
    page.getByRole("heading", { name: /A little book/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore the heat lesson" }).click();
  await expect(page.locator(".studio")).toBeVisible();
  await expect(page.locator(".claim-block")).not.toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
  await page.locator(".citation-chip").first().click();
  await expect(page.locator(".selected-source")).toBeVisible();
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(page.locator(".answer-options button")).toHaveCount(3);
  await page.locator(".answer-options button").first().click();
  await expect(page.locator(".recovery-trail")).toBeVisible();
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 attempts saved on this device")).toBeVisible();
  await page.goto("/app");
  await expect(
    page.getByRole("heading", {
      name: "Why a Metal Spoon Feels Colder",
      exact: true,
    }),
  ).toHaveCount(2);
});

test("public example downloads and restores as a separate editable companion", async ({
  page,
}) => {
  await page.goto("/guide");
  await page
    .getByText("Can I try importing something?", { exact: true })
    .click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download the example project" })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("heat-project.json");
  await page.goto("/app/new");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles((await download.path())!);
  await expect(page).toHaveURL(/\/app\/import-.+\/read/);
  await expect(page.locator(".claim-block")).not.toHaveCount(0);
  await page.reload();
  await expect(page.locator(".claim-block")).not.toHaveCount(0);
});
