import { useEffect, useRef, useState } from 'react';
import { generate, listModels, type ModelOption } from '../lib/cloud';
import type { Project } from '../lib/model';
import { readOnlyControls } from './ReadOnlyControls';
type Result = {
  model: string;
  text: string;
  latencyMs: number;
  tokens?: number;
  cost?: number;
  demo: boolean;
  error?: string;
};
export default function ModelExperiment({
  project,
  demo,
  onUpdate,
  readOnly = false,
}: {
  readOnly?: boolean;
  project: Project;
  demo: boolean;
  onUpdate: (p: Partial<Project>) => void;
}) {
  const [models, setModels] = useState<ModelOption[]>([]),
    [first, setFirst] = useState('auto'),
    [second, setSecond] = useState('auto'),
    [prompt, setPrompt] = useState('Propose an accessible sign-in flow with meaningful errors.'),
    [results, setResults] = useState<Result[]>(
      () => (project.workflow?.modelExperiment as { results?: Result[] })?.results || [],
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!demo)
      listModels()
        .then(setModels)
        .catch(() => setError('Model catalog unavailable. Automatic routing is still selectable.'));
    return () => abort.current?.abort();
  }, [demo]);
  const run = async () => {
    if (readOnly) {
      setError('Viewer access cannot run model comparisons.');
      return;
    }
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError('');
    setResults([]);
    const controller = new AbortController();
    abort.current = controller;
    const next: Result[] = [];
    for (const model of [first, second]) {
      if (controller.signal.aborted) break;
      const start = performance.now();
      try {
        if (demo) {
          next.push({
            model: model === 'auto' ? 'Demo candidate' : model,
            text:
              'Demonstration result for the shared task: ' +
              prompt +
              '\nDefine the primary action, validation feedback and keyboard focus. This is authored sample content, not a measured model result.',
            latencyMs: 0,
            demo: true,
          });
        } else {
          const result = await generate(
            {
              prompt,
              mode: 'chat',
              model,
              context: JSON.stringify({
                brief: project.brief,
                experiment:
                  'Same prompt and context for each candidate. Return useful output; do not score yourself.',
              }),
            },
            controller.signal,
          );
          next.push({
            model: result.model,
            text: result.text,
            latencyMs: Math.round(performance.now() - start),
            tokens: result.usage
              ? result.usage.promptTokens + result.usage.completionTokens
              : undefined,
            cost: result.usage?.cost,
            demo: false,
          });
        }
      } catch (e) {
        if (!controller.signal.aborted)
          next.push({
            model,
            text: '',
            latencyMs: Math.round(performance.now() - start),
            demo: false,
            error: e instanceof Error ? e.message : 'Provider failed',
          });
      }
      setResults([...next]);
    }
    if (next.length && !controller.signal.aborted)
      onUpdate({
        workflow: {
          ...project.workflow,
          modelExperiment: {
            prompt,
            requestedModels: [first, second],
            results: next,
            revision: project.revision,
            at: new Date().toISOString(),
          },
        },
      });
    setBusy(false);
  };
  return readOnlyControls(
    <section className="panel">
      <h3>Same task. Two model outputs.</h3>
      <p className="muted">
        {demo
          ? 'Demo mode shows labeled sample responses.'
          : 'Two sequential free-model requests use the same prompt and project brief. Each consumes a request from the shared daily allowance.'}{' '}
        Automatic routing may select the same model twice; select distinct model IDs for a
        controlled comparison.
      </p>
      <div className="grid-two">
        {[
          [first, setFirst, 'Candidate A'],
          [second, setSecond, 'Candidate B'],
        ].map(([value, set, label]) => (
          <label className="field" key={label as string}>
            {label as string}
            <select
              value={value as string}
              onChange={(e) => (set as (s: string) => void)(e.target.value)}
            >
              <option value="auto">Automatic free routing</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="field">
        Shared experiment prompt
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
      </label>
      <div className="row">
        <button className="button primary" disabled={busy || !prompt.trim()} onClick={run}>
          {busy ? 'Comparing…' : demo ? 'Rehearse comparison' : 'Run two-model comparison'}
        </button>
        {busy && (
          <button className="button" onClick={() => abort.current?.abort()}>
            Stop comparison
          </button>
        )}
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div className="diff-columns">
        {results.map((r, i) => (
          <article className="experience-item" key={i}>
            <strong>{r.model}</strong>
            <p className="muted">
              {r.demo
                ? 'Sample output · no latency or cost measurement'
                : `${r.latencyMs} ms · ${r.tokens ?? 'Unknown'} tokens · ${r.cost === undefined ? 'Cost unavailable' : '$' + r.cost}`}
            </p>
            {r.error ? <p role="alert">{r.error}</p> : <p className="preserve-lines">{r.text}</p>}
            <button
              className="button"
              disabled={r.demo || !!r.error}
              onClick={() =>
                onUpdate({
                  model: r.model,
                  agentModels: { ...project.agentModels, builder: r.model },
                })
              }
            >
              Use for future builds
            </button>
          </article>
        ))}
      </div>
    </section>,
    readOnly,
  );
}
