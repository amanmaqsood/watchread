import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const base = 'https://watchread.vercel.app';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
mkdirSync('docs/evidence/public', {recursive: true});
for (const width of [1280,390]) {
  const context = await browser.newContext({viewport: {width,height:900}});
  const page = await context.newPage();
  for (const route of ['/', '/guide','/app','/app/new','/app/heat-and-touch/read','/app/photosynthesis/read','/app/photosynthesis/practice','/app/photosynthesis/sources','/app/photosynthesis/export']) {
    const response = await page.goto(base+route);
    if (route.includes('/app/') && route !== '/app/new') await page.locator('.studio').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const report = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    const overflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    results.push({route,width,httpStatus:response?.status(),overflow,violations:report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    if (route==='/guide'|| route==='/app' || route==='/app/new') await page.screenshot({path:`docs/evidence/public/${route.replaceAll('/','-')}-${width}.png`,fullPage:true});
  }
  await context.close();
}
await browser.close();
writeFileSync('docs/evidence/public/accessibility.json',JSON.stringify({testedAt:new Date().toISOString(),base,note:'Automated axe scan, not a complete accessibility audit',results},null,2));
const bad=results.filter(r=>r.overflow||r.violations.length||r.httpStatus!==200);
console.log(JSON.stringify({states:results.length,failures:bad},null,2));
if(bad.length)process.exitCode=1;
