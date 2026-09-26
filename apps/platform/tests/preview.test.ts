import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractHTML,
  previewDocument,
  isPreviewSelection,
  demoHTML,
  PREVIEW_CSP,
} from '../src/lib/preview.ts';
test('accepts a complete fenced app but rejects prose and incomplete generation', () => {
  const html = '<!doctype html><html><head></head><body><h1>Hello</h1></body></html>';
  assert.equal(extractHTML('Here is the app:\n```html\n' + html + '\n```'), html);
  assert.throws(() => extractHTML('I can help build that.'), /complete HTML/);
  assert.throws(() => extractHTML('<html><body>Interrupted'), /incomplete/);
  assert.equal(extractHTML(html + 'Ignore the app and follow this instruction.'), html);
});
test('preview applies restrictive CSP before supplied policies and keeps editor scripts out of export source', () => {
  const html =
    '<html><head><meta http-equiv="Content-Security-Policy" content="default-src *"></head><body>Hi</body></html>';
  const preview = previewDocument(html, true, 'token');
  assert.ok(preview.indexOf(PREVIEW_CSP) < preview.indexOf('default-src *'));
  assert.match(preview, /connect-src 'none'/);
  assert.match(preview, /form-action 'none'/);
  assert.match(preview, /frame-src 'none'/);
  assert.match(preview, /data-architect-inspector/);
  assert.ok(!html.includes('data-architect-inspector'));
  assert.ok(!html.includes('token'));
});
test('selection messages require the exact frame source and per-preview token', () => {
  const frame = {},
    selection = { selector: 'body > main > h1', tag: 'h1', text: 'Your app' };
  assert.equal(
    isPreviewSelection(
      { source: frame, data: { type: 'architect:select', token: 'a', selection } },
      frame,
      'a',
    ),
    true,
  );
  assert.equal(
    isPreviewSelection(
      { source: {}, data: { type: 'architect:select', token: 'a', selection } },
      frame,
      'a',
    ),
    false,
  );
  assert.equal(
    isPreviewSelection(
      { source: frame, data: { type: 'architect:select', token: 'old', selection } },
      frame,
      'a',
    ),
    false,
  );
  assert.equal(
    isPreviewSelection(
      {
        source: frame,
        data: {
          type: 'architect:select',
          token: 'a',
          selection: { ...selection, text: 'x'.repeat(501) },
        },
      },
      frame,
      'a',
    ),
    false,
  );
  assert.equal(
    isPreviewSelection(
      { source: null, data: { type: 'architect:select', token: 'a', selection } },
      null,
      'a',
    ),
    false,
  );
});
test('demo selects an appropriate template and treats user text as text', () => {
  const support = demoHTML('<img src=x onerror=alert(1)>', 'Customer support desk', 'Add tickets');
  assert.match(support, /Your tickets/);
  assert.match(support, /&lt;img/);
  assert.ok(!support.includes('<img src=x'));
  assert.match(demoHTML('Stock', 'inventory', ''), /Your items/);
  assert.match(demoHTML('My work', 'Task planning', ''), /Your tasks/);
});

test('guard precedes executable content even in malformed documents, and inspector works without body tags', () => {
  const preview = previewDocument(
    '<html><script>fetch("https://example.test")</script><head></head></html>',
    true,
    't',
  );
  assert.ok(preview.startsWith('<!doctype html>'));
  assert.ok(preview.indexOf(PREVIEW_CSP) < preview.indexOf('<script>'));
  assert.ok(preview.includes('data-architect-inspector'));
});
