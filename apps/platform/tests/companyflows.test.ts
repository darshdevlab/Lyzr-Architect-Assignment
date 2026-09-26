import test from 'node:test';
import assert from 'node:assert/strict';
import {
  companyFeatures,
  companySchemas,
  companyDefaults,
  validateCompanyRecord,
  normalizeCompany,
  makeCompanyRecord,
  currencyTotal,
  capacitySummary,
  roleHome,
  canonicalCompanyRole,
} from '../src/lib/company-features.ts';

test('all 42 company packages have an owned, reviewable flow and handoff', () => {
  assert.equal(companyFeatures.length, 42);
  assert.equal(new Set(companyFeatures.map((f) => f.id)).size, 42);
  assert.deepEqual(Object.keys(companySchemas).sort(), companyFeatures.map((f) => f.id).sort());
  for (const f of companyFeatures) {
    const s = companySchemas[f.id];
    assert.ok(s.stages.length >= 3);
    assert.ok(s.fields.length >= 4);
    assert.ok(s.detail.length > 30);
    assert.ok(s.next && s.nextLabel);
    assert.equal(new Set(s.fields.map((x) => x.key)).size, s.fields.length);
  }
});
test('every feature requires accountable ownership and validates required evidence', () => {
  for (const f of companyFeatures) {
    const values = companyDefaults(f.id);
    const issues = validateCompanyRecord(f.id, '', '', values);
    assert.ok(issues.includes('A title is required.'));
    assert.ok(issues.includes('An accountable owner is required.'));
    for (const field of companySchemas[f.id].fields)
      if (field.required) values[field.key] = 'Evidence from a permitted source';
    assert.deepEqual(validateCompanyRecord(f.id, 'Reviewable record', 'Owner', values), [], f.id);
  }
});
test('delegation cannot be approved without scope limits', () => {
  assert.ok(
    validateCompanyRecord(
      'AGENT-N4',
      'Specialist',
      'Owner',
      { task: 'Research this topic' },
      'Approved',
    ).length,
  );
  assert.deepEqual(
    validateCompanyRecord(
      'AGENT-N4',
      'Specialist',
      'Owner',
      { task: 'Research this topic', budget: '0', concurrency: '2', depth: '1' },
      'Approved',
    ),
    [],
  );
  assert.ok(
    validateCompanyRecord(
      'AGENT-N4',
      'Specialist',
      'Owner',
      { task: 'Research', budget: '0', concurrency: '100', depth: '8' },
      'Approved',
    ).length,
  );
});
test('external publication confirmation requires external evidence', () => {
  assert.ok(
    validateCompanyRecord('MKT-N4', 'Publish', 'Owner', {}, 'Confirmed externally').includes(
      'A provider result ID or published URL is required to record external confirmation.',
    ),
  );
  assert.deepEqual(
    validateCompanyRecord(
      'MKT-N4',
      'Publish',
      'Owner',
      { external: 'https://example.com/published' },
      'Confirmed externally',
    ),
    [],
  );
});
test('financial totals do not mix currencies or archived records', () => {
  const a = makeCompanyRecord('FIN-N1', 'USD allocation', 'Owner', {
    amount: '100',
    currency: 'USD',
  });
  const b = makeCompanyRecord('FIN-N1', 'INR allocation', 'Owner', {
    amount: '9000',
    currency: 'INR',
  });
  const c = { ...a, id: 'archived', archived: true, values: { amount: '500', currency: 'USD' } };
  assert.equal(currencyTotal([a, b, c], 'FIN-N1', 'amount', 'USD'), 100);
  assert.equal(currencyTotal([a, b, c], 'FIN-N1', 'amount', 'INR'), 9000);
});
test('capacity respects leave context and excludes archived plans', () => {
  const a = makeCompanyRecord('PEOPLE-N3', 'Team', 'Owner', {
    capacity: '100',
    leave: '10',
    allocated: '80',
  });
  assert.deepEqual(capacitySummary([a]), { capacity: 90, allocated: 80, remaining: 10 });
  assert.deepEqual(capacitySummary([{ ...a, archived: true }]), {
    capacity: 0,
    allocated: 0,
    remaining: 0,
  });
});
test('untrusted stored data is normalized and invalid objects excluded', () => {
  const valid = makeCompanyRecord('CRM-N1', 'Customer', 'Owner', { company: 'Example' });
  assert.equal(
    normalizeCompany({ records: [valid, null, { feature: 'constructor', values: {} }] }).records
      .length,
    1,
  );
  assert.equal(
    normalizeCompany({ records: [{ ...valid, values: { company: { secret: 'object' } } }] }).records
      .length,
    0,
  );
  assert.equal(normalizeCompany(null).records.length, 0);
  assert.equal(
    normalizeCompany({ messages: [{ id: 'x', role: 'admin', text: 'bad', at: 'now' }] }).messages
      .length,
    0,
  );
});
test('role homes adapt for QA, HR, sales, finance and executive aliases', () => {
  assert.equal(canonicalCompanyRole('QA reviewer'), 'QA');
  assert.equal(canonicalCompanyRole('People & HR'), 'HR');
  assert.equal(canonicalCompanyRole('Executive'), 'CXO');
  assert.ok(roleHome('Finance').areas.includes('finance'));
  assert.ok(roleHome('Customer experience').areas.includes('success'));
  assert.notEqual(roleHome('Developer').intro, roleHome('Executive').intro);
});
test('workflow state must belong to the feature', () => {
  assert.ok(
    validateCompanyRecord('FIN-N1', 'Budget', 'Owner', {}, 'Won').includes(
      'Choose a stage supported by this workflow.',
    ),
  );
  assert.deepEqual(validateCompanyRecord('constructor', 'Title', 'Owner', {}), [
    'Unknown feature.',
  ]);
});

import { readStore, initialStore } from '../src/lib/model.ts';
test('company workspace survives persisted Store reload and rejects arrays', () => {
  const company = { version: 1, records: [], messages: [], departmentViews: {} };
  assert.deepEqual(readStore(JSON.stringify({ ...initialStore, company })).company, company);
  assert.equal(readStore(JSON.stringify({ ...initialStore, company: [] })).company, undefined);
});
