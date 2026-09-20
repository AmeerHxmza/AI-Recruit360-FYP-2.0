import { createRequire } from 'node:module';
const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url));
const { chromium } = frontendRequire('@playwright/test');
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
mkdirSync(new URL('../.artifacts/',import.meta.url),{recursive:true});
for (const width of [320,375,414,768,1440]) {
  await page.setViewportSize({width,height:960});
  for (const route of ['/', '/login','/signup','/forgot-password','/reset-password','/privacy']) {
    const response=await page.goto(`http://localhost:3100${route}`,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,`${route} loads`);
    assert.equal(await page.locator('h1').count(),1,`${route} has a clear page heading`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} fits ${width}px`);
  }
  console.log(`PASS public screens at ${width}px`);
}
await page.setViewportSize({width:1440,height:1000});
await page.goto('http://localhost:3100/',{waitUntil:'networkidle'});
await page.getByRole('button',{name:/Sam Rivera/}).click();
assert.match(await page.getByRole('tabpanel').textContent(),/inventory application/);
await page.getByRole('tab',{name:'Assessment',exact:true}).click();
assert.match(await page.getByRole('tabpanel').textContent(),/9 of 10/);
await page.getByRole('tab',{name:'Assessment',exact:true}).press('ArrowRight');
assert.equal(await page.getByRole('tab',{name:'Interview',exact:true}).getAttribute('aria-selected'),'true');
assert.match(await page.getByRole('tabpanel').textContent(),/execution plan/);
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await page.locator('[role="tabpanel"] > div').evaluate(el=>getComputedStyle(el).animationName),'none');
await page.emulateMedia({reducedMotion:'no-preference'});
await page.getByRole('button',{name:/Alex Morgan/}).click();
await page.getByRole('tab',{name:'Resume',exact:true}).click();
console.log('PASS preview selection, keyboard tabs, and reduced motion');

await page.screenshot({path:new URL('../.artifacts/home-desktop.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
await page.goto('http://localhost:3100/login',{waitUntil:'networkidle'});
await page.screenshot({path:new URL('../.artifacts/login-desktop.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
assert.deepEqual(errors,[],'No uncaught browser errors');
console.log('PASS browser runtime errors');
await browser.close();
