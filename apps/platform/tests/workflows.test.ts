import test from 'node:test';
import assert from 'node:assert/strict';
import {
  workflows,
  recipes,
  validateWorkflow,
  getDefaults,
  workflowKey,
  advancedSections,
  advancedDefaults,
  validateAdvanced,
  flowNodeTypes,
  validateFlowImport,
} from '../src/lib/workflows.ts';

test('all 65 version-two packages have a unique actionable recipe', () => {
  assert.equal(workflows.length, 65);
  assert.equal(new Set(workflows.map((f) => f.id)).size, 65);
  assert.deepEqual(Object.keys(recipes).sort(), workflows.map((f) => f.id).sort());
  for (const feature of workflows) {
    const recipe = recipes[feature.id];
    assert.ok(recipe.intro.length > 15);
    assert.ok(recipe.outcome.length > 30);
    assert.ok(recipe.fields.length >= 2);
    assert.ok(recipe.handoff);
    assert.ok(recipe.handoffLabel);
    assert.equal(new Set(recipe.fields.map((f) => f.key)).size, recipe.fields.length);
  }
});
test('required free-text inputs block progression; fully supplied forms progress', () => {
  for (const f of workflows) {
    const r = recipes[f.id];
    const blank = getDefaults(f.id);
    const count = r.fields.filter((x) => x.required && !x.options).length;
    assert.equal(validateWorkflow(f.id, blank).length, count, f.id);
    const filled = Object.fromEntries(
      r.fields.map((x) => [x.key, x.options?.[0] || 'Example review value']),
    );
    assert.deepEqual(validateWorkflow(f.id, filled), [], f.id);
  }
  assert.deepEqual(validateWorkflow('unknown', {}), ['Unknown workflow']);
});
test('project workflow storage has separate stable keys', () => {
  assert.equal(workflowKey('one'), 'architect:workflow:v2:one');
  assert.notEqual(workflowKey('one'), workflowKey('two'));
});
test('all handoffs target available version-two routes', () => {
  const routes = new Set([
    'today',
    'plan',
    'studio',
    'code',
    'agents',
    'models',
    'data',
    'qa',
    'release',
    'ops',
    'settings',
  ]);
  for (const r of Object.values(recipes)) assert.ok(routes.has(r.handoff), r.handoff);
});
test('high impact workflow results disclose draft/simulated behavior', () => {
  for (const id of [
    'CODE-E2',
    'CODE-N2',
    'RELEASE-E1',
    'RELEASE-N2',
    'RELEASE-N4',
    'AGENT-E3',
    'DATA-E1',
  ])
    assert.match(recipes[id].outcome, /draft|proposal|prototype|No |not |No\b|does not/i, id);
});

test('advanced controls cover each product with valid default configuration', () => {
  assert.equal(advancedSections.length, 22);
  for (const section of advancedSections) {
    assert.deepEqual(validateAdvanced(section, advancedDefaults(section)), [], section.id);
  }
  assert.equal(flowNodeTypes.length, 33);
  assert.equal(new Set(flowNodeTypes).size, 33);
});
test('model ranges, malformed schemas and listing limits reject invalid values', () => {
  const model = advancedSections.find((s) => s.id === 'model-parameters')!;
  assert.equal(
    validateAdvanced(model, { ...advancedDefaults(model), temperature: '7', topP: '-1' }).length,
    2,
  );
  const output = advancedSections.find((s) => s.id === 'agent-output')!;
  assert.match(
    validateAdvanced(output, { ...advancedDefaults(output), schema: '{broken' })[0],
    /valid JSON/,
  );
  const listing = advancedSections.find((s) => s.id === 'release-listing')!;
  assert.equal(
    validateAdvanced(listing, {
      ...advancedDefaults(listing),
      short: 'a'.repeat(161),
      tags: '1,2,3,4,5,6,7,8,9',
    }).length,
    2,
  );
});
test('workflow imports reject invalid graphs, duplicates and unknown parents', () => {
  const lead = { id: 'lead', name: 'Lead', role: 'Coordinate', x: 10, y: 10, parent: null };
  const child = { id: 'child', name: 'Child', role: 'Task', x: 10, y: 20, parent: 'lead' };
  assert.deepEqual(validateFlowImport([lead, child]), []);
  assert.ok(validateFlowImport([lead, { ...child, parent: 'missing' }]).length);
  assert.ok(validateFlowImport([lead, child, child]).length);
  assert.ok(
    validateFlowImport([{ ...lead, parent: 'child' }, child]).some((e) => e.includes('cycle')),
  );
  assert.ok(validateFlowImport([{ ...lead, x: 'no' }]).length);
  assert.ok(validateFlowImport([]).length);
});
