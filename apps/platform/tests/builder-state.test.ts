import test from 'node:test';
import assert from 'node:assert/strict';
import {
  builderContext,
  checkpoint,
  workflowPrompt,
  readDraft,
  writeDraft,
  clearDraft,
} from '../src/lib/builderState.ts';
import { previewDocument } from '../src/lib/preview.ts';
const p = {
  id: 'test',
  title: 'Example',
  brief: 'Build an app',
  prd: 'PRD',
  trd: 'TRD',
  attachments: [],
  workflow: { sources: [{ name: 'Rules', detail: 'Use semantic buttons' }] },
} as any;
test('builder context includes saved source/design decisions as valid JSON', () => {
  const c = builderContext(p);
  assert.equal(c.truncated, false);
  assert.deepEqual(JSON.parse(c.text).workflow, p.workflow);
});
test('large escaped source is bounded valid JSON with explicit truncation flag', () => {
  const c = builderContext({
    ...p,
    html: '"\\\n'.repeat(300000),
    attachments: [{ name: 'large', text: 'a'.repeat(100000) }],
  });
  assert.ok(c.text.length <= 39000);
  assert.equal(c.truncated, true);
  assert.equal(JSON.parse(c.text).contextTruncated, true);
});
test('chronological checkpoint insertion preserves newest twenty even for mixed legacy order', () => {
  const history = Array.from({ length: 25 }, (_, i) => ({
    id: String(i),
    html: String(i),
    label: String(i),
    at: new Date(2020, 0, i + 1).toISOString(),
  })).reverse();
  const result = checkpoint(history, 'current', 'Before edit');
  assert.equal(result.length, 20);
  assert.equal(result.at(-1)?.html, 'current');
  assert.equal(result[0].id, '6');
  assert.ok(!result.some((x) => x.id === '0'));
});
test('visual handoff includes both target and user instruction', () => {
  assert.equal(workflowPrompt('BUILD-E1', { prompt: 'Exact user prompt' }), 'Exact user prompt');
  assert.match(
    workflowPrompt('BUILD-E2', {
      target: 'heading',
      instruction: 'Make it clearer',
      apply: 'Review before apply',
    }),
    /heading: Make it clearer/,
  );
});
test('drafts survive editor unmount and remain project scoped', () => {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => map.set(k, v),
      removeItem: (k: string) => map.delete(k),
    },
  });
  writeDraft('a', 'prd', 'unsaved');
  assert.equal(readDraft('a', 'prd', 'saved'), 'unsaved');
  assert.equal(readDraft('b', 'prd', 'other'), 'other');
  clearDraft('a', 'prd');
  assert.equal(readDraft('a', 'prd', 'saved'), 'saved');
  delete (globalThis as any).sessionStorage;
});
test('selection inspector can toggle without regenerating source and checks parent/token', () => {
  const result = previewDocument('<html><body>Hello</body></html>', false, 'test-token');
  assert.match(result, /architect:selection-mode/);
  assert.match(result, /e.source===parent/);
  assert.match(result, /e.data.token===token/);
  assert.match(result, /let selecting=false/);
  assert.match(result, /connect-src 'none'/);
});
