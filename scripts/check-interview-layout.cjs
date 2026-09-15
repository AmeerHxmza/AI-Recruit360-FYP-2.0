// Visual fixture of actual components; never contacts Supabase, Simli, or OpenAI.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const frontend = path.join(root, 'frontend');
const localRequire = Module.createRequire(path.join(frontend, 'package.json'));
const ts = localRequire('typescript');
const React = localRequire('react');
const { renderToStaticMarkup } = localRequire('react-dom/server');
const { chromium } = localRequire('@playwright/test');
const question = { id: 'fixture', question_number: 4, question_text: 'In your project, you integrated speech recognition. Can you elaborate on how you handled session management and API latency to ensure smooth user interactions in that application?' };
let stateIndex = 0;
const state = ['fixture', question, 'I kept each session isolated and measured request durations before changing the implementation.', false, '', false, false];
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react' && parent?.filename.endsWith(path.join('[application-id]', 'page.tsx')))
    return { ...React, useState: initial => React.useState(stateIndex < state.length ? state[stateIndex++] : initial) };
  if (request === 'react' && parent?.filename.endsWith('simli-avatar-player.tsx'))
    return { ...React, useState: initial => React.useState(initial === 'off' ? 'ready' : initial) };
  if (request === 'next/navigation') return { useParams: () => ({ 'application-id': 'fixture' }) };
  if (request === 'next/link') return ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
  if (request.startsWith('@/app/actions/')) return {};
  return originalLoad.call(this, request.startsWith('@/') ? path.join(frontend, request.slice(2)) : request, parent, isMain);
};
Module._extensions['.css'] = () => {};
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  module._compile(output, filename);
};
const Page = localRequire('./app/interview-room/[application-id]/page.tsx').default;
const html = renderToStaticMarkup(React.createElement(Page));
const cssRoot = path.join(frontend, '.next/static/css');
const styles = fs.readdirSync(cssRoot, { recursive: true }).filter(file => file.endsWith('.css')).map(file => fs.readFileSync(path.join(cssRoot, file), 'utf8')).join('\n');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    for (const [width, height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,600],[390,844]]) {
      await page.setViewportSize({ width, height });
      await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style></head><body>${html}</body></html>`);
      // A square source with edge markers makes clipping visible in the screenshot.
      await page.locator('.interviewer-video video').evaluate(video => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><rect width="640" height="640" fill="#dce2e2"/><rect x="8" y="8" width="624" height="624" rx="10" fill="none" stroke="#6b8185" stroke-width="6"/><path d="M120 640 Q130 430 320 430 Q510 430 520 640" fill="#33465b"/><ellipse cx="320" cy="280" rx="105" ry="145" fill="#b8c3c5"/><path d="M208 275 Q180 95 320 95 Q460 95 432 290 Q420 155 320 160 Q220 150 208 275" fill="#33465b"/><text x="320" y="45" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#33465b">Top of source frame</text><text x="320" y="615" text-anchor="middle" font-family="sans-serif" font-size="20" fill="white">Bottom of source frame</text></svg>';
        video.poster = 'data:image/svg+xml,' + encodeURIComponent(svg);
      });
      const result = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, prompt: rect('.interview-prompt'), answer: rect('.interview-answer'), question: rect('.interview-question'), video: rect('.interviewer-video'), controls: rect('.interview-answer-actions'), videoFit: getComputedStyle(document.querySelector('.interviewer-video video')).objectFit };
      });
      assert.ok(result.scrollWidth <= width + 1, 'No horizontal page overflow');
      if (width >= 1024) {
        assert.ok(result.scrollHeight <= height + 1, `Desktop fits viewport: ${JSON.stringify(result)}`);
        assert.ok(result.prompt.right <= result.answer.left, 'Avatar left, question and answer right');
        assert.ok(result.question.left >= result.answer.left && result.question.right <= result.answer.right, 'Question is inside answer panel');
        assert.equal(result.videoFit, 'contain', 'Entire video frame remains visible without cropping');
        assert.ok(result.video.width >= result.prompt.width - 3, 'Avatar fills the left panel width');
        assert.ok(result.controls.bottom <= height, 'Answer controls visible');
        assert.ok(result.video.height >= 100, `Avatar remains visible: ${result.video.height}px`);
      } else assert.ok(result.prompt.bottom <= result.answer.top, 'Mobile stacks panels');
      fs.mkdirSync(path.join(root, '.artifacts'), { recursive: true });
      await page.screenshot({ path: path.join(root, '.artifacts', `interview-layout-${width}.png`), fullPage: true });
      if (width === 1366) {
        await page.locator('.interview-question h2').evaluate(el => el.textContent = 'A longer interview question with several details to consider. '.repeat(50));
        assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'Long questions stay inside viewport');
        assert.ok(await page.locator('.interview-question').evaluate(el => el.scrollHeight > el.clientHeight), 'Long question has its own scroll area');
      }
      console.log(`PASS interview layout ${width}x${height}`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
