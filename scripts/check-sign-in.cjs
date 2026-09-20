// Exercise the compiled login form with synthetic Auth responses, never real credentials.
const { createRequire } = require('node:module');
const req = createRequire(require('node:path').resolve('frontend/package.json'));
const { chromium } = req('@playwright/test');
req('@next/env').loadEnvConfig(require('node:path').resolve('frontend'));
const assert = require('node:assert/strict');
const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} };
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = enc({ alg: 'HS256' }) + '.' + enc({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 }) + '.fixture';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const scenario of ['invalid', 'success', 'stalled']) {
      const context = await browser.newContext();
      let authenticatedNavigation = false;
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.hostname === host) {
          if (url.pathname.endsWith('/token')) {
            if (scenario === 'stalled') return; // No response: browser must abort it.
            return route.fulfill({ status: scenario === 'invalid' ? 400 : 200, contentType: 'application/json', body: JSON.stringify(scenario === 'invalid'
              ? { code: 'invalid_credentials', msg: 'Invalid login credentials' }
              : { access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, user }) });
          }
          return route.fulfill({ status: 200, contentType: 'application/json', body: url.pathname.includes('/rest/') ? '[]' : JSON.stringify(user) });
        }
        if (url.hostname === 'localhost' && url.pathname === '/dashboard') {
          authenticatedNavigation = route.request().isNavigationRequest() && Boolean((await context.cookies()).find(c => c.name.includes('auth-token')));
          return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Workspace fixture</h1>' });
        }
        return route.continue();
      });
      const page = await context.newPage();
      await page.goto('http://localhost:3100/login');
      await page.locator('input[type=email]').fill(user.email);
      await page.locator('input[type=password]').fill('synthetic-password');
      await page.getByRole('button', { name: 'Sign In to Workspace' }).click();
      if (scenario === 'success') {
        await page.getByRole('heading', { name: 'Workspace fixture' }).waitFor();
        assert.ok(authenticatedNavigation, 'fresh navigation sends saved session cookies');
      } else {
        await page.locator('[role=alert]:not(#__next-route-announcer__)').waitFor({ timeout: 28000 });
        assert.equal(await page.getByRole('button', { name: 'Sign In to Workspace' }).isEnabled(), true);
        if (scenario === 'invalid') assert.match(await page.locator('[role=alert]:not(#__next-route-announcer__)').textContent(), /incorrect/);
      }
      console.log(`PASS sign-in ${scenario}`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
