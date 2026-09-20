import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome" });
const results: unknown[] = [];
mkdirSync("docs/evidence", { recursive: true });
for (const width of [1280, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
  });
  const page = await context.newPage();
  for (const route of [
    "/",
    "/app",
    "/app/new",
    "/app/photosynthesis/read",
    "/app/photosynthesis/practice",
    "/app/photosynthesis/sources",
    "/app/photosynthesis/export",
  ]) {
    await page.goto(base + route);
    if (route.includes("photosynthesis"))
      await page.locator(".studio").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    results.push({
      width,
      route,
      overflow,
      violations: report.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  await page.goto(base + "/app/photosynthesis/practice");
  await page
    .getByRole("button", { name: "A Minerals absorbed from the soil" })
    .click();
  await page.getByRole("button", { name: /Revisit the explanation/ }).click();
  const feedback = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  results.push({
    width,
    route: "practice-feedback-and-source",
    violations: feedback.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
  await page.screenshot({
    path: `docs/evidence/practice-${width}.png`,
    fullPage: true,
  });
  await context.close();
}
await browser.close();
writeFileSync(
  "docs/evidence/accessibility.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      engine: "axe-core automated scan; not a complete accessibility audit",
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 2));
