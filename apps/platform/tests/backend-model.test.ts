import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialStore,
  createProject,
  addProject,
  updateProject,
  readStore,
  canRelease,
  buildHTML,
} from '../src/lib/model.ts';
test('project survives reload with prompt, plan, history and routing intact', () => {
  const base = structuredClone(initialStore);
  const p = createProject(
    ' Intake portal ',
    ' Collect requests and track approval ',
    'https://github.com/example/repo',
    'project-a',
  );
  const saved = addProject(base, {
    ...p,
    draft: 'Make the approval button clearer',
    html: '<!doctype html><html><body>Preview</body></html>',
    history: [
      { id: 'v1', html: '<p>Earlier</p>', at: '2026-09-26T00:00:00Z', label: 'First version' },
    ],
    model: 'qwen/example:free',
    agentModels: { qa: 'qwen/example:free' },
  });
  const restored = readStore(JSON.stringify(saved));
  assert.equal(restored.activeProject, 'project-a');
  assert.equal(restored.projects[0].draft, 'Make the approval button clearer');
  assert.equal(restored.projects[0].history?.[0].label, 'First version');
  assert.equal(restored.projects[0].agentModels?.qa, 'qwen/example:free');
  assert.match(restored.projects[0].prd, /Collect requests/);
  assert.match(restored.projects[0].trd, /https:\/\/github.com\/example\/repo/);
});
test('editing one project cannot alter another or the saved source snapshot', () => {
  const a = createProject('A', 'Alpha', '', 'a'),
    b = createProject('B', 'Beta', '', 'b');
  const source = { ...structuredClone(initialStore), projects: [a, b], activeProject: 'a' };
  const before = JSON.stringify(source);
  const changed = updateProject(source, 'a', { draft: 'New prompt', reviewed: false });
  assert.equal(JSON.stringify(source), before);
  assert.equal(changed.projects[1], b);
  assert.equal(changed.projects[0].draft, 'New prompt');
  assert.equal(changed.activeProject, 'a');
});
test('invalid and old persisted data recover without poisoning global defaults', () => {
  for (const raw of ['broken', 'null', '{"version":99}', '{"version":1,"projects":{},"bots":[]}']) {
    const s = readStore(raw);
    assert.deepEqual(s.projects, []);
    s.bots[0].name = 'Mutated';
    assert.notEqual(initialStore.bots[0].name, 'Mutated');
  }
  const s = readStore(JSON.stringify({ ...initialStore, theme: 'unsupported', mode: 'neon' }));
  assert.equal(s.theme, 'atelier');
  assert.equal(s.mode, 'light');
});
test('malformed persisted project entries cannot reach rendering code', () => {
  const s = readStore(
    JSON.stringify({
      ...initialStore,
      projects: [null, { id: 'bad', title: 3 }],
      activeProject: 'bad',
    }),
  );
  assert.ok(
    s.projects.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        typeof p.title === 'string' &&
        Array.isArray(p.messages) &&
        Array.isArray(p.tasks),
    ),
  );
  assert.ok(s.activeProject === null || s.projects.some((p) => p.id === s.activeProject));
});
test('release requires both build and explicit review, and HTML escaping prevents title injection', () => {
  const p = createProject('</title><script>alert(1)</script>', 'App');
  assert.equal(canRelease(p), false);
  assert.equal(canRelease({ ...p, built: true }), false);
  assert.equal(canRelease({ ...p, reviewed: true }), false);
  assert.equal(canRelease({ ...p, built: true, reviewed: true }), true);
  const html = buildHTML({
    ...p,
    headline: '<img src=x onerror=alert(1)>',
    accent: 'red;}</style><script>attack()</script>',
  });
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>attack()'));
  assert.ok(!html.includes('<img src=x'));
});
test('cloud-shaped workspace roundtrip preserves project workflows and isolates project decisions', () => {
  const workflow = {
    completed: {
      'QA-E1': { at: '2026-09-26T16:00:00Z', revision: 3, values: { suite: 'Accessibility' } },
    },
    activity: [{ id: 'review-1', text: 'Review saved' }],
    agents: [{ id: 'builder', name: 'Builder', parent: null }],
    decisions: { model: 'auto' },
  };
  const a = { ...createProject('A', 'First app', '', 'a'), workflow };
  const b = createProject('B', 'Second app', '', 'b');
  const body = JSON.stringify({
    workspace_data: { ...structuredClone(initialStore), projects: [a, b], activeProject: 'a' },
    expected_revision: 4,
  });
  // Supabase persists the workspace JSON object unchanged; deserialize its response shape.
  const dbResponse = JSON.parse(
    JSON.stringify({ data: JSON.parse(body).workspace_data, revision: 5 }),
  );
  const reloaded = readStore(JSON.stringify(dbResponse.data));
  assert.deepEqual(reloaded.projects[0].workflow, workflow);
  assert.equal(reloaded.projects[1].workflow, undefined);
  assert.equal(dbResponse.revision, 5);
  const changed = updateProject(reloaded, 'b', { workflow: { decisions: { model: 'manual' } } });
  assert.deepEqual(changed.projects[0].workflow, workflow);
});
