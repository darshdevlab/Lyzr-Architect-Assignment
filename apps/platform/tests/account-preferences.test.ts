import test from 'node:test';
import assert from 'node:assert/strict';
import {
  accountTab,
  defaultPreferences,
  normalizePreferences,
  loadPreferences,
  persistPreferences,
  upsertSupportDraft,
  visibleNotifications,
} from '../src/lib/account-preferences.ts';
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}
test('malformed stored collections and primitive preferences cannot poison account rendering', () => {
  for (const raw of [
    null,
    [],
    true,
    4,
    'bad',
    {
      inbox: {},
      ledger: null,
      support: 'wrong',
      quiet: 'false',
      autoRecharge: 'true',
      cap: NaN,
      timezone: 'Not/AZone',
      plan: 'Paid live',
      language: {},
    },
  ]) {
    const p = normalizePreferences(raw);
    assert.ok(Array.isArray(p.inbox) && Array.isArray(p.ledger) && Array.isArray(p.support));
    assert.equal(p.quiet, false);
    assert.equal(p.autoRecharge, false);
    assert.equal(p.cap, 0);
    assert.equal(p.plan, 'Free prototype');
    assert.doesNotThrow(() => visibleNotifications(p, 'Unread'));
  }
});
test('invalid nested rows, duplicate IDs and fabricated ledger values are discarded', () => {
  const row = {
    id: 'a',
    type: '100 demo credits',
    amount: 100,
    status: 'Completed',
    at: '2026-09-27T00:00:00Z',
  };
  const p = normalizePreferences({
    inbox: [null, { id: 'n', title: 'Check', read: 'yes' }, { id: 'n', title: 'Duplicate' }],
    ledger: [
      row,
      row,
      { ...row, id: 'b', amount: -20 },
      { ...row, id: 'c', status: 'Paid' },
      { ...row, id: 'd', at: 'nonsense' },
    ],
    support: [null, { id: 's', reference: 'REMOTE-123', body: 'No', updatedAt: row.at }],
  });
  assert.equal(p.inbox.length, 1);
  assert.equal(p.inbox[0].read, false);
  assert.equal(p.ledger.length, 1);
  assert.equal(p.support.length, 0);
});
test('support reference survives save, reload and editing; accounts are isolated', () => {
  const store = storage(),
    initial = defaultPreferences(),
    created = upsertSupportDraft(
      initial,
      '  Expected save, saw an error.  ',
      undefined,
      '2026-09-27T00:00:00Z',
      'abcd1234',
    );
  persistPreferences(store, 'user-one', created.preferences);
  const reloaded = loadPreferences(store, 'user-one');
  assert.equal(reloaded.support[0].reference, 'LOCAL-ABCD1234');
  assert.equal(reloaded.support[0].body, 'Expected save, saw an error.');
  assert.equal(loadPreferences(store, 'user-two').support.length, 0);
  const updated = upsertSupportDraft(
    reloaded,
    'Now with reproduction steps',
    created.draft.id,
    '2026-09-27T01:00:00Z',
    'unused-id',
  );
  assert.equal(updated.draft.reference, created.draft.reference);
  assert.equal(updated.preferences.support.length, 1);
  assert.equal(initial.support.length, 0);
  persistPreferences(store, 'user-one', updated.preferences);
  assert.equal(loadPreferences(store, 'user-one').support[0].body, 'Now with reproduction steps');
});
test('storage failure is surfaced rather than pretending a support draft was saved', () => {
  const store = {
    setItem() {
      throw new Error('quota exceeded');
    },
  };
  assert.throws(() => persistPreferences(store, 'user', defaultPreferences()), /quota exceeded/);
  assert.ok(
    loadPreferences(
      {
        getItem() {
          throw new Error('blocked');
        },
      },
      'user',
    ).inbox.length,
  );
});
test('notification archive, unread and empty filters are consistent after reload', () => {
  const p = defaultPreferences();
  assert.equal(visibleNotifications(p, 'Unread').length, 1);
  p.inbox[0].read = true;
  assert.equal(visibleNotifications(p, 'Unread').length, 0);
  p.inbox[0].archived = true;
  const roundtrip = normalizePreferences(JSON.parse(JSON.stringify(p)));
  assert.equal(visibleNotifications(roundtrip, 'Inbox').length, 0);
  assert.equal(visibleNotifications(roundtrip, 'Archived').length, 1);
  roundtrip.inbox[0].archived = false;
  assert.equal(visibleNotifications(roundtrip, 'Inbox').length, 1);
});
test('support input is bounded and removing a saved draft persists', () => {
  assert.throws(() => upsertSupportDraft(defaultPreferences(), '   '));
  assert.throws(() => upsertSupportDraft(defaultPreferences(), 'x'.repeat(4001)));
  const store = storage(),
    created = upsertSupportDraft(
      defaultPreferences(),
      'A valid draft',
      undefined,
      '2026-09-27T00:00:00Z',
      'abcd1234',
    );
  persistPreferences(store, 'user', { ...created.preferences, support: [] });
  assert.deepEqual(loadPreferences(store, 'user').support, []);
});

test('account deep links choose only known tabs', () => {
  assert.equal(accountTab('Billing preview'), 'Billing preview');
  assert.equal(accountTab('Notifications'), 'Notifications');
  for (const invalid of [undefined, '', 'arbitrary', {}, '__proto__'])
    assert.equal(accountTab(invalid), 'Preferences');
});
