import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronDown, RotateCcw, X } from 'lucide-react';
import { generate } from '../lib/cloud';
import guide from '../lib/support-knowledge.json';
import './support-chat.css';

type Message = { role: 'user' | 'assistant'; text: string; source?: string };
const welcome: Message = {
  role: 'assistant',
  text: 'Hi! What can I help you with? Ask about building, accounts, models or the features available in this prototype.',
  source: 'Architect support',
};
export default function SupportChat({
  active,
  demo,
  onNavigate,
}: {
  active: boolean;
  demo: boolean;
  onNavigate: (view: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (open && active) input.current?.focus();
  }, [open, active]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy, open]);
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  async function send(value = draft) {
    const prompt = value.trim();
    if (busy || prompt.length < 3) return;
    setError('');
    if (demo) {
      const topic = guide.find((item) => item.question === prompt);
      setMessages((previous) => [
        ...previous,
        { role: 'user', text: prompt },
        {
          role: 'assistant',
          text:
            topic?.answer ||
            'Sign in to ask the AI assistant a custom question. You can explore the help topics below without an account; these are saved guide answers, not AI replies.',
          source: 'Demo · saved help guide',
        },
      ]);
      setDraft('');
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    const conversation = [...messages.slice(-8), { role: 'user' as const, text: prompt }];
    setMessages((previous) => [...previous, { role: 'user', text: prompt }]);
    setDraft('');
    try {
      const result = await generate(
        {
          prompt,
          mode: 'support',
          model: 'auto',
          context: conversation
            .slice(0, -1)
            .map((m) => `${m.role}: ${m.text.slice(0, 1600)}`)
            .join('\n'),
        },
        controller.signal,
      );
      setMessages((previous) => [
        ...previous,
        { role: 'assistant', text: result.text, source: `AI reply · ${result.model}` },
      ]);
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(
          e instanceof Error ? e.message : 'The assistant could not reply. Please try again.',
        );
        setDraft(prompt);
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  if (!active) return null;
  return (
    <div className="support-widget">
      {open && (
        <section
          className="support-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="support-heading"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              close();
            }
          }}
        >
          <header>
            <img src="/architect-mascot.svg" alt="" width="42" height="42" />
            <div>
              <h2 id="support-heading">Customer support</h2>
              <span>
                {demo ? 'Demo help guide · Sign in for AI' : 'AI assistant · Free models'}
              </span>
            </div>
            <button
              className="icon-button"
              aria-label="New support conversation"
              disabled={busy}
              onClick={() => {
                setMessages([welcome]);
                setError('');
                setDraft('');
                input.current?.focus();
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button className="icon-button" aria-label="Close support chat" onClick={close}>
              <X size={18} />
            </button>
          </header>
          <div
            className="support-messages"
            ref={log}
            role="log"
            aria-label="Support conversation"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((message, i) => (
              <div key={i} className={'support-message ' + message.role}>
                {message.source && <small>{message.source}</small>}
                <p>{message.text}</p>
              </div>
            ))}
            {busy && (
              <p className="support-thinking" role="status">
                Thinking…
              </p>
            )}
          </div>
          <div className="support-topics" aria-label="Help topics">
            {guide.slice(0, 4).map((topic) => (
              <button key={topic.title} disabled={busy} onClick={() => void send(topic.question)}>
                {topic.title}
              </button>
            ))}
          </div>
          {error && (
            <p className="support-error" role="alert">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor="support-question">
              Your support question
            </label>
            <textarea
              ref={input}
              id="support-question"
              placeholder="How can we help?"
              value={draft}
              maxLength={3000}
              rows={2}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              className="support-send"
              type="submit"
              aria-label="Send support question"
              disabled={busy || draft.trim().length < 3}
            >
              <ArrowUp size={19} />
            </button>
          </form>
          <footer>
            <span>
              {demo
                ? 'Saved guide answers. AI requires sign-in.'
                : 'AI can make mistakes. Uses your AI allowance.'}{' '}
              Don’t share passwords or keys.
            </span>
            <button onClick={() => onNavigate('help')}>Help centre ↗</button>
          </footer>
        </section>
      )}
      <button
        ref={launcher}
        className={'support-launcher ' + (open ? 'is-open' : '')}
        aria-label={open ? 'Minimize support chat' : 'Open customer support'}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? (
          <ChevronDown size={28} />
        ) : (
          <img src="/architect-mascot.svg" alt="" width="52" height="52" />
        )}
      </button>
    </div>
  );
}
