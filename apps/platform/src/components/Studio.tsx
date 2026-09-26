import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUp,
  Paperclip,
  Code2,
  Monitor,
  Smartphone,
  MousePointer2,
  ExternalLink,
  Download,
  Check,
  FileText,
  ChevronDown,
  X,
  History,
  Square,
  RefreshCw,
  Gamepad2,
  GitBranch,
  Save,
  Undo2,
  LoaderCircle,
  SlidersHorizontal,
} from 'lucide-react';
import type { Project, Message } from '../lib/model';
import { uid, buildHTML } from '../lib/model';
import { generate, listModels, type ModelOption } from '../lib/cloud';
import {
  demoHTML,
  extractHTML,
  isPreviewSelection,
  previewDocument,
  type ElementSelection,
} from '../lib/preview';
import { Status, Modal } from './UI';
import Games from './Games';
import { readOnlyControls } from './ReadOnlyControls';
import {
  readDraft,
  writeDraft,
  clearDraft,
  checkpoint,
  builderContext,
  type BuilderNavigation,
} from '../lib/builderState';
import './studio.css';
export function download(name: string, text: string, type = 'text/plain') {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
type Props = {
  readOnly?: boolean;
  navigationContext?: BuilderNavigation;
  project: Project;
  onUpdate: (patch: Partial<Project>) => void;
  onPlan: (document?: 'prd' | 'trd') => void;
  onReview: () => void;
  notify: (s: string) => void;
  accessToken?: string;
  demo?: boolean;
};
export default function Studio({
  project: p,
  onUpdate: writeProject,
  onPlan,
  onReview,
  notify,
  demo = true,
  navigationContext,
  readOnly = false,
}: Props) {
  const onUpdate = (patch: Partial<Project>) => {
    if (readOnly) {
      notify('Viewer access: changes are disabled.');
      return;
    }
    writeProject(patch);
  };
  const [tab, setTab] = useState<'preview' | 'code'>('preview'),
    [mobile, setMobile] = useState(false),
    [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState<ElementSelection | null>(null),
    [modelOpen, setModelOpen] = useState(false),
    [historyOpen, setHistoryOpen] = useState(false),
    [games, setGames] = useState(false),
    [models, setModels] = useState<ModelOption[]>([]),
    [modelError, setModelError] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [lastPrompt, setLastPrompt] = useState(''),
    [elapsed, setElapsed] = useState(0),
    [code, setCode] = useState(''),
    [codeDirty, setCodeDirty] = useState(false),
    [images, setImages] = useState<{ name: string; dataUrl: string }[]>([]),
    [candidate, setCandidate] = useState(() => readDraft(p.id, 'candidate', '')),
    [compare, setCompare] = useState(false),
    [queue, setQueue] = useState<string[]>([]);
  useEffect(() => {
    if (navigationContext?.panel === 'history') setHistoryOpen(true);
    if (navigationContext?.panel === 'models') setModelOpen(true);
    if (navigationContext?.panel === 'games') setGames(true);
  }, [navigationContext]);
  const upload = useRef<HTMLInputElement>(null),
    frame = useRef<HTMLIFrameElement>(null),
    controller = useRef<AbortController | null>(null),
    conversation = useRef<HTMLDivElement>(null),
    latest = useRef(p),
    running = useRef(false);
  latest.current = p;
  const html = p.html || (p.built ? buildHTML(p) : '');
  const token = useMemo(() => uid(), [html]);
  const src = useMemo(() => (html ? previewDocument(html, false, token) : ''), [html, token]);
  const chosen = p.model || 'auto',
    effective = p.agentModels?.builder || chosen;
  const context = builderContext(p);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'architect:selection-mode', token, enabled: selecting },
      '*',
    );
  }, [selecting, token]);
  useEffect(() => {
    const draft = readDraft(p.id, 'html', html);
    setCode(draft);
    setCodeDirty(draft !== html);
  }, [html, p.id]);
  useEffect(() => {
    let alive = true;
    if (!demo)
      listModels()
        .then((m) => {
          if (alive) setModels(m);
        })
        .catch(() => {
          if (alive)
            setModelError('Model catalogue is unavailable. Automatic routing may still work.');
        });
    return () => {
      alive = false;
    };
  }, [demo]);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  useEffect(() => {
    controller.current?.abort();
    setSelected(null);
    setImages([]);
    setError('');
  }, [p.id]);
  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);
  useEffect(() => {
    conversation.current?.scrollTo({
      top: conversation.current.scrollHeight,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [p.messages.length, busy]);
  useEffect(() => {
    function receive(e: MessageEvent) {
      if (isPreviewSelection(e, frame.current?.contentWindow, token)) {
        setSelected(e.data.selection);
        setSelecting(false);
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [token]);
  function commit(result: string, label: string, messages?: Message[]) {
    const current = latest.current;
    const previous = current.html || (current.built ? buildHTML(current) : '');
    const history = previous
      ? checkpoint(current.history || [], previous, label)
      : current.history || [];
    onUpdate({
      html: result,
      built: true,
      stage: 'Build',
      reviewed: false,
      revision: current.revision + 1,
      history,
      ...(messages ? { messages } : {}),
    });
    clearDraft(current.id, 'html');
    setSelected(null);
    setTab('preview');
  }
  async function build(prompt: string) {
    if (readOnly) {
      notify('Viewer access cannot run generation.');
      return;
    }
    if (!prompt.trim() || running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setLastPrompt(prompt);
    const current = latest.current,
      at = new Date().toISOString();
    const selectionContext = selected
      ? `\n\nEdit only this selected element where possible: ${selected.selector}\nCurrent text: ${selected.text}`
      : '';
    const user: Message = {
      id: uid(),
      role: 'user',
      text: prompt + (selected ? `\nSelected: ${selected.selector}` : ''),
      time: at,
    };
    onUpdate({ draft: '', messages: [...current.messages, user] });
    const abort = new AbortController();
    controller.current = abort;
    try {
      let output: string, description: string;
      if (demo) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, 700);
          abort.signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timeout);
              reject(new DOMException('Stopped', 'AbortError'));
            },
            { once: true },
          );
        });
        output = demoHTML(current.title, current.brief, prompt);
        description =
          'Created an interactive demo template selected from your brief (tasks, support or inventory). This demonstrates the flow; arbitrary prompt edits require live AI. You can edit the HTML directly.';
      } else {
        const response = await generate(
          {
            prompt: prompt + selectionContext,
            mode: 'app',
            model: effective,
            images,
            context: builderContext({ ...current, html: html || undefined }).text,
          },
          abort.signal,
        );
        output = extractHTML(response.text);
        description = `Built with ${response.model}. The preview runs in an isolated frame. Review the output and test key flows before release.${response.usage ? ` ${response.usage.promptTokens + response.usage.completionTokens} tokens used.` : ''}${Number.isFinite(response.remaining) ? ` At the end of this run, ${response.remaining} of your daily prototype requests remained. Shared and provider limits also apply.` : ''}`;
      }
      if (abort.signal.aborted || latest.current.id !== current.id) return;
      if (selected && current.built) {
        setCandidate(output);
        writeDraft(p.id, 'candidate', output);
        onUpdate({
          messages: [
            ...current.messages,
            user,
            {
              id: uid(),
              role: 'assistant',
              text:
                'Candidate ready for review. Compare it with the current artifact before applying. ' +
                description,
              time: new Date().toISOString(),
            },
          ],
        });
        notify('Candidate ready to compare.');
        return;
      }
      commit(output, current.built ? 'Before: ' + prompt.slice(0, 65) : 'First version', [
        ...current.messages,
        user,
        { id: uid(), role: 'assistant', text: description, time: new Date().toISOString() },
      ]);
      notify(demo ? 'Demo template ready.' : 'Your generated application is ready.');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Generation stopped. Your previous version is safe.');
      } else {
        setError(e instanceof Error ? e.message : 'Generation failed. Please try again.');
      }
    } finally {
      running.current = false;
      setBusy(false);
      controller.current = null;
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) {
      if (p.draft.trim()) {
        setQueue((q) => [...q, p.draft.trim()]);
        onUpdate({ draft: '' });
        notify('Instruction queued. Review and run it after this build.');
      }
      return;
    }
    void build(p.draft);
  }
  async function attach(files: FileList | null) {
    if (!files) return;
    const accepted: { name: string; text: string }[] = [],
      screens: { name: string; dataUrl: string }[] = [];
    for (const f of Array.from(files)) {
      if (/^image\/(png|jpeg|webp)$/.test(f.type)) {
        if (f.size > 1_000_000) {
          notify('Screenshots must be PNG, JPEG or WebP under 1 MB.');
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        screens.push({ name: f.name, dataUrl });
        continue;
      }
      if (f.size > 100_000 || !/\.(txt|md|json|csv|html|css|js|tsx|ts)$/i.test(f.name)) {
        notify('Use a text/source file under 100 KB or a screenshot under 1 MB.');
        continue;
      }
      accepted.push({ name: f.name, text: await f.text() });
    }
    if (accepted.length)
      onUpdate({ attachments: [...latest.current.attachments, ...accepted].slice(0, 8) });
    if (screens.length) {
      setImages((previous) => [...previous, ...screens].slice(0, 2));
      onUpdate({ model: 'auto', agentModels: { ...latest.current.agentModels, builder: 'auto' } });
      notify(
        'Screenshot attached for this session. Live AI will use an available free vision model.',
      );
    }
    if (upload.current) upload.current.value = '';
  }
  function saveCode() {
    try {
      commit(extractHTML(code), 'Before manual code edit');
      notify('Code saved. Review is required again.');
    } catch (e) {
      notify(
        e instanceof Error && !/complete HTML|incomplete/.test(e.message)
          ? e.message
          : 'Save a complete HTML document with opening and closing html tags. Your previous version is unchanged.',
      );
    }
  }
  function restore(id: string) {
    const entry = p.history?.find((h) => h.id === id);
    if (!entry) return;
    commit(entry.html, 'Before restoring ' + entry.label);
    setHistoryOpen(false);
    notify('Checkpoint restored. Previous output is saved in history.');
  }
  return readOnlyControls(
    <div className="studio">
      <section className="studio-chat">
        <header>
          <div>
            <span className="eyebrow">Build conversation</span>
            <h2>From intention to interface.</h2>
          </div>
          <Status tone={busy ? 'working' : ''}>
            {demo ? 'Demo mode' : busy ? 'Building' : 'Live AI'}
          </Status>
        </header>
        <div className="context-tray">
          <button onClick={() => onPlan('prd')}>
            <FileText size={13} />
            PRD · v{p.revision}
          </button>
          <button onClick={() => onPlan('trd')}>
            <FileText size={13} />
            TRD
          </button>
          {p.repo && (
            <span>
              <GitBranch size={12} />
              Repository linked
            </span>
          )}
        </div>
        <div ref={conversation} className="conversation" aria-live="polite">
          {p.messages.length === 0 ? (
            <div className="studio-intro">
              <div className="agent-orb" />
              <h3>
                Describe the idea.
                <br />
                Shape every detail.
              </h3>
              <p>
                Your plan is attached. Build the first version, or tell Architect exactly where to
                begin.
              </p>
              <blockquote>{p.brief}</blockquote>
              <button
                className="button"
                onClick={() =>
                  onUpdate({
                    draft:
                      'Build the first version using the attached PRD and TRD. Make it polished, responsive and interactive.',
                  })
                }
              >
                Use my plan <ArrowUp size={14} />
              </button>
              <div className="prompt-suggestions">
                <button
                  onClick={() =>
                    onUpdate({
                      draft:
                        'Create a support desk with searchable tickets, priority filters, ticket creation and a detail panel.',
                    })
                  }
                >
                  A support workspace
                </button>
                <button
                  onClick={() =>
                    onUpdate({
                      draft:
                        'Build a task planner with add, complete, delete, search and a progress overview.',
                    })
                  }
                >
                  A focused task planner
                </button>
              </div>
            </div>
          ) : (
            p.messages.map((m) => (
              <article className={'message ' + m.role} key={m.id}>
                <div className="message-who">
                  {m.role === 'user'
                    ? 'You'
                    : demo
                      ? 'Architect · Demo template'
                      : 'Architect · Builder'}
                </div>
                <p>{m.text}</p>
              </article>
            ))
          )}
          {busy && (
            <div className="generation-status" role="status">
              <LoaderCircle size={18} className="spin" />
              <div>
                <b>{demo ? 'Preparing your demo' : 'Builder is generating your application'}</b>
                <p>
                  {elapsed}s elapsed ·{' '}
                  {demo
                    ? 'Local template'
                    : effective === 'auto'
                      ? 'Automatic free-model routing'
                      : effective}
                </p>
                <small>Testing begins after generation. No test results are assumed.</small>
              </div>
              <button className="button small" onClick={() => setGames(true)}>
                <Gamepad2 size={14} />
                Take a pause
              </button>
            </div>
          )}
          {queue.length > 0 && (
            <div className="notice">
              <strong>Queued instructions · {queue.length}</strong>
              {queue.map((q, i) => (
                <div key={i}>
                  <p>{q}</p>
                  <button
                    type="button"
                    className="button small"
                    disabled={busy}
                    onClick={() => {
                      setQueue((items) => items.filter((_, n) => n !== i));
                      onUpdate({ draft: q });
                    }}
                  >
                    Load into composer
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setQueue((items) => items.filter((_, n) => n !== i))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="notice error" role="alert">
              <p>{error}</p>
              <button
                className="button small"
                disabled={busy}
                onClick={() => void build(lastPrompt)}
              >
                <RefreshCw size={14} />
                Retry last prompt
              </button>
            </div>
          )}
        </div>
        {context.truncated && (
          <div className="notice" role="status">
            Large project context: source, documents and attachments will be summarized by bounded
            excerpts. Review or reduce attachments for a focused change.
          </div>
        )}
        <form className="composer" onSubmit={submit}>
          {images.length > 0 && (
            <div className="attachment-list screenshot-attachments">
              {images.map((a, i) => (
                <span key={a.name + i}>
                  <img
                    src={a.dataUrl}
                    alt="Attached screenshot"
                    style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 4 }}
                  />
                  {a.name}
                  <button
                    type="button"
                    aria-label={'Remove screenshot ' + a.name}
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <small>
                Session only ·{' '}
                {demo ? 'Demo does not interpret screenshots' : 'Vision model routing'}
              </small>
            </div>
          )}
          {selected && (
            <div className="selected-context">
              <MousePointer2 size={13} />
              <span>
                <b>{selected.tag}</b> · {selected.text.slice(0, 70) || selected.selector}
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label="Clear selected element"
                onClick={() => setSelected(null)}
              >
                <X size={13} />
              </button>
            </div>
          )}
          {p.attachments.length > 0 && (
            <div className="attachment-list">
              {p.attachments.map((a, i) => (
                <span key={i}>
                  <Paperclip size={11} />
                  {a.name}
                  <button
                    type="button"
                    aria-label={'Remove ' + a.name}
                    onClick={() =>
                      onUpdate({ attachments: p.attachments.filter((_, idx) => idx !== i) })
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            aria-label="Build prompt"
            value={p.draft}
            onChange={(e) => onUpdate({ draft: e.target.value })}
            placeholder={
              selected
                ? 'Describe the change to this element…'
                : p.built
                  ? 'Ask for a change, or select an element…'
                  : 'Describe the application you want to build…'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (!busy) void build(p.draft);
              }
            }}
          />
          <div className="composer-actions">
            <input
              ref={upload}
              type="file"
              hidden
              accept=".txt,.md,.json,.csv,.html,.css,.js,.ts,.tsx,.png,.jpg,.jpeg,.webp"
              multiple
              onChange={(e) => void attach(e.target.files)}
            />
            <button
              disabled={busy}
              type="button"
              className="icon-button"
              aria-label="Attach context files"
              onClick={() => upload.current?.click()}
            >
              <Paperclip size={16} />
            </button>
            <button
              disabled={busy}
              type="button"
              className="model-selector"
              onClick={() => setModelOpen(true)}
            >
              <span className="model-name">
                {demo
                  ? 'Demo template'
                  : effective === 'auto'
                    ? 'Auto · Free models'
                    : models.find((m) => m.id === effective)?.name || effective}
              </span>
              <ChevronDown size={12} />
            </button>
            {busy && p.draft.trim() && (
              <button className="button small" type="submit">
                Queue next change
              </button>
            )}
            {busy ? (
              <button
                type="button"
                className="send"
                aria-label="Stop generation"
                onClick={() => controller.current?.abort()}
              >
                <Square size={16} />
              </button>
            ) : (
              <button className="send" disabled={!p.draft.trim()} aria-label="Send build prompt">
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </form>
        <div className="composer-note">
          {demo ? 'Demo templates · No AI credits used' : 'Server-side AI · Free models only'} ·
          ⌘/Ctrl + Enter
        </div>
      </section>
      <section className="studio-output">
        <header className="preview-toolbar">
          <div className="segmented">
            <button aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>
              <Monitor size={14} />
              Preview
            </button>
            <button aria-pressed={tab === 'code'} onClick={() => setTab('code')}>
              <Code2 size={14} />
              Code
            </button>
          </div>
          <div className="row">
            <button
              className={'icon-button ' + (mobile ? 'selected' : '')}
              aria-label="Toggle narrow preview"
              aria-pressed={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <Smartphone size={17} />
            </button>
            <button
              className="button small"
              disabled={!p.built || busy}
              aria-pressed={selecting}
              onClick={() => {
                setSelecting(!selecting);
                setTab('preview');
              }}
            >
              <MousePointer2 size={14} />
              {selecting ? 'Stop selecting' : 'Select element'}
            </button>
            <button
              className="icon-button"
              aria-label="Open version history"
              disabled={!p.history?.length || busy}
              onClick={() => setHistoryOpen(true)}
            >
              <History size={17} />
            </button>
            <button
              className="icon-button"
              disabled={!p.built}
              aria-label="Export application HTML"
              onClick={() => download('index.html', html, 'text/html')}
            >
              <Download size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Open build break games"
              onClick={() => setGames(true)}
            >
              <Gamepad2 size={17} />
            </button>
          </div>
        </header>
        {candidate && (
          <div className="notice">
            <strong>Candidate change ready</strong>
            <button className="button" onClick={() => setCompare(true)}>
              Compare before / after
            </button>
            <button
              className="button primary"
              onClick={() => {
                commit(candidate, 'Before applying visual candidate');
                clearDraft(p.id, 'candidate');
                setCandidate('');
                setCompare(false);
              }}
            >
              Apply candidate
            </button>
            <button
              className="text-button"
              onClick={() => {
                clearDraft(p.id, 'candidate');
                setCandidate('');
                setCompare(false);
              }}
            >
              Discard candidate
            </button>
          </div>
        )}
        {selecting && (
          <div className="notice">
            Click an element in the preview, then describe your change in the prompt. Selection mode
            temporarily pauses app interactions.
          </div>
        )}
        {tab === 'code' && p.built && (
          <div className="code-toolbar">
            <span>{codeDirty ? 'Unsaved changes' : 'index.html · Saved'}</span>
            <div className="row">
              <button
                className="button small"
                disabled={!codeDirty || busy}
                onClick={() => {
                  clearDraft(p.id, 'html');
                  setCode(html);
                  setCodeDirty(false);
                }}
              >
                <Undo2 size={14} />
                Discard
              </button>
              <button
                className="button primary small"
                disabled={!codeDirty || busy}
                onClick={saveCode}
              >
                <Save size={14} />
                Save code
              </button>
            </div>
          </div>
        )}
        <div className={'preview-canvas ' + (mobile && tab === 'preview' ? 'narrow' : '')}>
          {p.built ? (
            tab === 'preview' ? (
              <iframe
                ref={frame}
                title="Application preview"
                sandbox="allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                srcDoc={src}
              />
            ) : (
              <textarea
                className="source-code code-editor"
                aria-label="Application HTML source"
                spellCheck={false}
                value={code}
                disabled={busy}
                onChange={(e) => {
                  setCode(e.target.value);
                  writeDraft(p.id, 'html', e.target.value);
                  setCodeDirty(true);
                }}
              />
            )
          ) : (
            <div className="blank-preview">
              <div className="preview-illustration">
                <div />
                <div />
                <div />
              </div>
              <span className="eyebrow">Your next idea, taking shape</span>
              <h2>It starts with a prompt.</h2>
              <p>
                Describe your app on the left. Preview, refine and test it here without losing your
                context.
              </p>
              <span className="hint">Plan → Build → Review → Release</span>
            </div>
          )}
        </div>
        <footer className="studio-status">
          <span>
            {p.built
              ? `v${p.revision} · ${demo ? 'Demo template' : 'Generated HTML'} · Isolated preview`
              : 'Ready for your first prompt'}
          </span>
          <button disabled={!p.built || busy} onClick={onReview}>
            Review & test <ExternalLink size={13} />
          </button>
        </footer>
      </section>
      {modelOpen && (
        <Modal title="The right model for the job." onClose={() => setModelOpen(false)}>
          <p className="muted">
            Choose a model or let Architect route to an available free model. Paid models are
            excluded from this prototype.
          </p>
          {demo ? (
            <div className="notice">
              You are exploring without an account. Sign in to use live AI; the demo template works
              without a key.
            </div>
          ) : (
            <>
              <label className="field">
                Default build model
                <select value={chosen} onChange={(e) => onUpdate({ model: e.target.value })}>
                  <option value="auto">Auto · available free models</option>
                  {models
                    .filter((m) => !images.length || m.supportsImages)
                    .map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name} · {m.family}
                      </option>
                    ))}
                </select>
              </label>
              {modelError && (
                <p role="status" className="notice">
                  {modelError}
                </p>
              )}
              <div className="agent-routing">
                <h3>
                  <SlidersHorizontal size={16} /> Model per agent
                </h3>
                <p className="muted">
                  Builder runs in this workspace. Planner and reviewer preferences are saved for
                  their workflows.
                </p>
                {['planner', 'builder', 'reviewer'].map((role) => (
                  <label className="field" key={role}>
                    {role}
                    <select
                      value={p.agentModels?.[role] || ''}
                      onChange={(e) =>
                        onUpdate({ agentModels: { ...p.agentModels, [role]: e.target.value } })
                      }
                    >
                      <option value="">Use default model</option>
                      <option value="auto">Automatic routing</option>
                      {models
                        .filter((m) => !images.length || m.supportsImages)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </label>
                ))}
              </div>
            </>
          )}
          <div className="modal-footer">
            <button className="button primary" onClick={() => setModelOpen(false)}>
              <Check size={15} />
              Done
            </button>
          </div>
        </Modal>
      )}
      {historyOpen && (
        <Modal title="Every version, within reach." onClose={() => setHistoryOpen(false)}>
          <p className="muted">
            Restoring a checkpoint saves your current output first. Up to 20 previous versions are
            retained.
          </p>
          <div className="history-list">
            {[...(p.history || [])].reverse().map((h) => (
              <div className="setting-row" key={h.id}>
                <div>
                  <b>{h.label}</b>
                  <p>{new Date(h.at).toLocaleString()}</p>
                </div>
                <button className="button small" onClick={() => restore(h.id)}>
                  <History size={14} />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {compare && candidate && (
        <Modal title="Review the visual change" wide onClose={() => setCompare(false)}>
          <p className="muted">
            Left: current app. Right: proposed change. Both are isolated previews. Apply the
            candidate only after checking its behavior.
          </p>
          <div className="diff-columns">
            <iframe
              title="Current artifact"
              sandbox="allow-scripts allow-forms"
              srcDoc={previewDocument(html, false, 'compare-before')}
              style={{ width: '100%', height: 430, border: 0 }}
            />
            <iframe
              title="Proposed artifact"
              sandbox="allow-scripts allow-forms"
              srcDoc={previewDocument(candidate, false, 'compare-after')}
              style={{ width: '100%', height: 430, border: 0 }}
            />
          </div>
          <button
            className="button primary"
            onClick={() => {
              commit(candidate, 'Before applying visual candidate');
              clearDraft(p.id, 'candidate');
              setCandidate('');
              setCompare(false);
            }}
          >
            Apply reviewed change
          </button>
        </Modal>
      )}
      {games && (
        <Modal title="A small break. A fresh perspective." onClose={() => setGames(false)}>
          <Games
            projectId={p.id}
            preferences={
              (
                p.workflow?.records as { id: string; values: Record<string, string> }[] | undefined
              )?.find((r) => r.id === 'BUILD-N3')?.values
            }
          />
        </Modal>
      )}
    </div>,
    readOnly,
  );
}
