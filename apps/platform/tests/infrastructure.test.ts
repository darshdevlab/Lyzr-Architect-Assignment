import test from 'node:test';
import assert from 'node:assert/strict';
import {
  infraDefaults,
  normalizeInfrastructure,
  validateInfrastructure,
  deploymentBundle,
  infrastructureFlows,
} from '../src/lib/infrastructure.ts';
test('private plans require identity, network and explicit acknowledgement', () => {
  assert.equal(validateInfrastructure(infraDefaults).length, 3);
  assert.deepEqual(
    validateInfrastructure({
      ...infraDefaults,
      identity: 'role/runner',
      network: 'vpc-demo',
      approval: true,
    }),
    [],
  );
});
test('unsafe runner and budget values are rejected', () => {
  assert.equal(
    validateInfrastructure({
      ...infraDefaults,
      identity: 'role',
      network: 'net',
      approval: true,
      cpu: '0',
      memory: '999',
      budget: '-1',
    }).length,
    3,
  );
});
test('installation bundle is explicitly a nonexecuting plan', () => {
  const b = deploymentBundle(infraDefaults);
  assert.equal(b.prototype, true);
  assert.equal(infrastructureFlows.length, 2);
  assert.match(b.limitations.join(' '), /No cloud resources/);
});

test('malformed infrastructure persistence cannot crash forms or recovery lists', () => {
  const p = normalizeInfrastructure({
    name: 17,
    steps: 'wrong',
    events: [null, { at: 3, action: 'wrong' }],
    approval: 'true',
  });
  assert.equal(p.name, infraDefaults.name);
  assert.deepEqual(p.steps, []);
  assert.deepEqual(p.events, []);
  assert.equal(p.approval, false);
});
