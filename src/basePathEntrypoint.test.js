import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('injects the runtime base before relative production assets', () => {
  const htmlRoot = mkdtempSync(join(tmpdir(), 'market-base-path-'));

  try {
    writeFileSync(
      join(htmlRoot, 'index.html'),
      '<html><head><script src="./assets/app.js"></script></head><body></body></html>',
    );

    execFileSync('sh', [resolve('40-create-base-path.sh')], {
      env: {
        ...process.env,
        MARKET_WEBSITE_HTML_ROOT: htmlRoot,
        NGINX_BASE_PATH: '/market',
      },
    });

    const html = readFileSync(join(htmlRoot, 'index.html'), 'utf8');
    assert.ok(html.includes('<base href="/market/" />'));
    assert.ok(html.includes("window.__MARKET_BASE_PATH__='/market'"));
    assert.ok(html.indexOf('<base ') < html.indexOf('./assets/app.js'));
    assert.equal(readlinkSync(join(htmlRoot, 'market')), htmlRoot);
  } finally {
    rmSync(htmlRoot, { recursive: true, force: true });
  }
});
