import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAppearance,
  defaultAppearance,
  readAppearance,
  saveAppearance,
} from '../src/lib/appearance.ts';
import { contextFromUrl, writeContext, roleDestination } from '../src/lib/navigation.ts';
import {
  makeLifecycleRun,
  advanceLifecycle,
  compatibilityIssues,
} from '../src/lib/private-lifecycle.ts';
test('invalid preferences cannot break the sign-in theme', () => {
  assert.deepEqual(normalizeAppearance(null), defaultAppearance);
  assert.deepEqual(
    normalizeAppearance({ theme: 'external', mode: 'invalid', compact: 'yes' }),
    defaultAppearance,
  );
  assert.deepEqual(normalizeAppearance({ theme: 'prism', mode: 'dark', compact: true }), {
    theme: 'prism',
    mode: 'dark',
    compact: true,
  });
});
test('exact company record handoff survives serialized URL and drops old target state', () => {
  const u = writeContext(new URL('https://example.test/?record=old&tab=old&company=c&project=p'), {
    recordId: 'new',
    sourceId: 'origin',
    tab: 'Records',
    returnView: 'revenue',
  });
  assert.deepEqual(contextFromUrl(u.href), {
    recordId: 'new',
    sourceId: 'origin',
    returnView: 'revenue',
    tab: 'Records',
  });
  assert.equal(u.searchParams.get('company'), 'c');
  assert.equal(u.searchParams.get('project'), 'p');
});
test('returning role entry respects edition scope', () => {
  assert.equal(roleDestination('Developer', 2), 'code');
  assert.equal(roleDestination('Designer', 2), 'buildflows');
  assert.equal(roleDestination('developer', 3), 'company');
  assert.equal(roleDestination('admin', 4), 'infrastructure');
});
test('failed private rehearsal resumes at the failed step without replaying completed steps', () => {
  let r = makeLifecycleRun('Restore', 'staging', '4.0.0', 'test');
  r = advanceLifecycle(r);
  r = advanceLifecycle(r, true);
  assert.equal(r.steps[0].status, 'Passed');
  assert.equal(r.steps[1].status, 'Failed');
  r = advanceLifecycle(r);
  assert.equal(r.steps[1].status, 'Passed');
  while (r.status !== 'Completed') r = advanceLifecycle(r);
  assert.equal(r.simulation, true);
  assert.deepEqual(advanceLifecycle(r), r);
});
test('cancelled private rehearsal never advances', () => {
  const r = { ...makeLifecycleRun('Retire', 'staging', '4', 'x'), status: 'Cancelled' as const };
  assert.deepEqual(advanceLifecycle(r), r);
});
test('provider runtime mismatch is explained before infrastructure approval', () => {
  assert.deepEqual(compatibilityIssues('AWS', 'Docker Compose'), []);
  assert.equal(compatibilityIssues('Azure', 'EC2 runner').length, 1);
  assert.equal(compatibilityIssues('AWS', 'GCP Cloud Run').length, 1);
});

test('builder panel and document survive cross-edition handoff URLs', () => {
  const u = writeContext(new URL('https://example.test/?view=studio'), {
    panel: 'history',
    document: 'trd',
    source: 'plan',
  });
  assert.deepEqual(contextFromUrl(u.href), { panel: 'history', document: 'trd', source: 'plan' });
});

test('signed-out theme selection is applied at next account entry and retained independently', () => {
  const prior = {
    local: globalThis.localStorage,
    session: globalThis.sessionStorage,
    location: globalThis.location,
  };
  const storage = () => {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => m.set(k, v),
      removeItem: (k: string) => m.delete(k),
    };
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage(), configurable: true });
  Object.defineProperty(globalThis, 'location', { value: { search: '' }, configurable: true });
  try {
    saveAppearance({ theme: 'atelier', mode: 'light', compact: false }, 'member');
    saveAppearance({ theme: 'prism', mode: 'dark', compact: true });
    assert.deepEqual(readAppearance('member'), { theme: 'prism', mode: 'dark', compact: true });
    assert.equal(readAppearance().mode, 'dark');
    assert.equal(readAppearance('member').theme, 'prism');
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { value: prior.local, configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: prior.session,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'location', { value: prior.location, configurable: true });
  }
});
