import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCompanyRecord, normalizeCompany } from '../src/lib/company-features.ts';
import {
  reviseRecord,
  recordMeta,
  requestReview,
  decideReview,
  hasApproval,
  voteRecord,
  companyEvidence,
  calculateVariance,
  parseImport,
  companyRun,
  validateTeamGraph,
} from '../src/lib/company-workflows.ts';
const author = { id: 'one', name: 'Author' },
  reviewer = { id: 'two', name: 'Reviewer' };
const record = () =>
  makeCompanyRecord(
    'MKT-N2',
    'Launch draft',
    'Author',
    { content: 'Version one', claims: 'Evidence' },
    'project',
  );
test('content revision records prior values and invalidates approval', () => {
  let r = requestReview(record(), author, reviewer.id);
  r = decideReview(r, reviewer, 'Approved', 'Claims checked', false);
  assert.ok(hasApproval(r));
  const changed = reviseRecord(
    r,
    { ...r, values: { ...r.values, content: 'Version two' } },
    author,
  );
  assert.equal(recordMeta(changed).revision, 2);
  assert.equal(recordMeta(changed).snapshots[0].values.content, 'Version one');
  assert.equal(hasApproval(changed), false);
});
test('self approval and unassigned reviewer are blocked; demo is explicitly attributed', () => {
  const r = requestReview(record(), author, reviewer.id);
  assert.throws(() => decideReview(r, author, 'Approved', 'Checked', true), /author/);
  assert.throws(
    () => decideReview(r, { id: 'three', name: 'Other' }, 'Approved', 'Checked', false),
    /assigned/,
  );
  const demo = decideReview(r, author, 'Approved', 'Rehearsal', false, true);
  assert.equal(recordMeta(demo).review?.decidedBy?.id, 'demo-reviewer');
});
test('one actor cannot inflate idea votes and can retract their vote', () => {
  const r = record();
  const voted = voteRecord(r, author);
  assert.equal(voted.values.votes, '1');
  assert.equal(voteRecord(voted, author).values.votes, '0');
});
test('handoff evidence preserves problem, insight, billing and provenance fields', () => {
  const r = {
    ...record(),
    values: {
      problem: 'Cannot save',
      finding: 'Customer impact',
      amount: '42',
      source: 'Interview',
    },
  };
  for (const value of Object.values(r.values)) assert.ok(companyEvidence(r).includes(value));
});
test('variance and zero baseline are explicit', () => {
  const r = { ...record(), values: { plan: '100', actual: '120', forecast: '135' } };
  assert.deepEqual(calculateVariance(r), {
    plan: 100,
    actual: 120,
    forecast: 135,
    variance: 20,
    forecastVariance: 35,
    percent: 20,
  });
  assert.equal(calculateVariance({ ...r, values: { plan: '0' } }).percent, null);
});
test('CSV preview validates header and rows', () => {
  assert.equal(parseImport('title,email\nA,a@example.com')[0].email, 'a@example.com');
  assert.throws(() => parseImport('email\na@example.com'), /title/);
  assert.throws(() => parseImport('title,email\nA,a@example.com,extra'), /column/);
});
test('simulations remain labeled and pin source revision', () => {
  const r = record();
  const run = companyRun(r, 'sync');
  assert.equal(run.sourceRevision, 1);
  assert.equal(run.status, 'Needs review');
  assert.ok(run.steps.every((s) => s.state === 'Simulated' && s.evidence.includes('No provider')));
});
test('management and execution cycles are rejected independently', () => {
  const base = { role: '', name: '', model: '', tools: '', x: 0, y: 0 };
  assert.equal(
    validateTeamGraph([
      { ...base, id: 'lead', parent: '', dependsOn: '' },
      { ...base, id: 'child', parent: 'lead', dependsOn: 'lead' },
    ]),
    '',
  );
  assert.match(
    validateTeamGraph([
      { ...base, id: 'lead', parent: 'child', dependsOn: '' },
      { ...base, id: 'child', parent: 'lead', dependsOn: '' },
    ]),
    /management/,
  );
  assert.match(
    validateTeamGraph([
      { ...base, id: 'lead', parent: '', dependsOn: 'child' },
      { ...base, id: 'child', parent: 'lead', dependsOn: 'lead' },
    ]),
    /execution/,
  );
});
test('graph changes invalidate an approved behavior revision', () => {
  let r = requestReview(record(), author, reviewer.id);
  r = decideReview(r, reviewer, 'Approved', 'Checked', false);
  const changed = reviseRecord(r, { ...r, meta: { ...recordMeta(r), graph: [] } }, author);
  assert.equal(hasApproval(changed), false);
  assert.equal(recordMeta(changed).revision, 2);
});
test('normalization preserves records beyond the old silent 500 limit', () => {
  const records = Array.from({ length: 501 }, () => record());
  assert.equal(normalizeCompany({ records }).records.length, 501);
});
import { sprintReadiness, reportingCycle } from '../src/lib/company-workflows.ts';
test('sprint lifecycle checks dates, scope and capacity before activation', () => {
  const sprint = { ...record(), values: { start: '2026-10-01', end: '2026-10-15', capacity: '5' } };
  const task = { ...record(), values: { estimate: '6' } };
  assert.match(sprintReadiness(sprint, []), /scope/);
  assert.match(sprintReadiness(sprint, [task]), /capacity/);
  assert.equal(sprintReadiness(sprint, [{ ...task, values: { estimate: '3' } }]), '');
  assert.match(
    sprintReadiness({ ...sprint, values: { ...sprint.values, end: '2026-09-01' } }, [task]),
    /date/,
  );
});
test('directory manager hierarchy rejects indirect cycles', () => {
  const a = { ...record(), id: 'a', values: { managerId: 'b' } },
    b = { ...record(), id: 'b', values: { managerId: '' } };
  assert.equal(reportingCycle([a, b], 'b', 'a'), true);
  assert.equal(reportingCycle([a, b], 'a', 'b'), false);
});
test('durable drafts survive company normalization without becoming published records', () => {
  const drafts = {
    'member:feature': {
      feature: 'CRM-N5',
      title: 'Unfinished proposal',
      owner: 'Member',
      stage: 'Draft',
      values: { terms: 'Needs review' },
      projectId: 'project',
      at: '2026-09-27',
    },
  };
  const data = normalizeCompany({ drafts, records: [] });
  assert.deepEqual(data.drafts, drafts);
  assert.equal(data.records.length, 0);
});
