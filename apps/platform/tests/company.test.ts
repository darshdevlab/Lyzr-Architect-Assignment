import test from 'node:test';
import assert from 'node:assert/strict';
import {
  companyRoles,
  roleLabels,
  canManageCompany,
  canWriteCompany,
  invitationUrl,
  parseInvite,
} from '../src/lib/company.ts';
test('role capabilities match database owner/admin/contributor/viewer boundary', () => {
  for (const role of companyRoles) {
    assert.equal(canManageCompany(role), role === 'owner' || role === 'admin');
    assert.equal(canWriteCompany(role), role !== 'viewer');
    assert.ok(roleLabels[role]);
  }
  assert.equal(canWriteCompany('unknown' as never), false);
  for (const role of ['sales', 'finance', 'hr', 'cx', 'executive'] as const) {
    assert.equal(canWriteCompany(role), true);
    assert.equal(canManageCompany(role), false);
  }
});
test('single-use invitation token remains in fragment rather than HTTP request query', () => {
  const token = 'a'.repeat(64);
  const link = invitationUrl(token, 'https://architect.example');
  const u = new URL(link);
  assert.equal(u.searchParams.has('invite'), false);
  assert.equal(u.hash, '#invite=' + token);
  assert.equal(parseInvite(link), token);
  assert.equal(parseInvite(token), token);
});
test('invalid invitations fail locally without accepting partial tokens or executable URL content', () => {
  for (const token of [
    'short',
    'A'.repeat(64),
    'a'.repeat(63),
    'a'.repeat(65),
    'javascript:alert(1)',
    'https://site.test/?invite=' + 'a'.repeat(64),
  ])
    assert.throws(() => parseInvite(token));
  assert.throws(() => invitationUrl('bad', 'https://architect.example'));
});
