import { useEffect, useRef, useState, useId, type ReactNode } from 'react';
import { X, ArrowUpRight, Check, Sun, Moon, Monitor, ChevronRight } from 'lucide-react';
import type { Store, Theme, Mode } from '../lib/model';
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={wide ? 'wide' : ''}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-top">
        <span className="eyebrow">Architect workspace</span>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
export const themes: { id: Theme; name: string; description: string }[] = [
  { id: 'atelier', name: 'Atelier', description: 'Warm neutrals. Terracotta detail.' },
  { id: 'current', name: 'Current', description: 'Soft greens. Space to breathe.' },
  { id: 'prism', name: 'Prism', description: 'Violet tones. Precise contrast.' },
];
export function ThemeOptions({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="theme-options">
      {themes.map((t) => (
        <button
          key={t.id}
          className={'theme-option ' + t.id}
          aria-pressed={t.id === theme}
          onClick={() => onChange(t.id)}
        >
          <div className="theme-art">
            <span>architect / {t.name.toLowerCase()}</span>
            <strong>
              {t.id === 'atelier'
                ? 'Make room for good work.'
                : t.id === 'current'
                  ? 'Find your natural flow.'
                  : 'A different perspective.'}
            </strong>
            <div className="theme-rings" />
          </div>
          <div className="theme-caption">
            <b>{t.name}</b>
            {t.id === theme ? <Check size={16} /> : <ArrowUpRight size={16} />}
          </div>
          <p>{t.description}</p>
        </button>
      ))}
    </div>
  );
}
export function Appearance({
  store,
  onSave,
  onClose,
}: {
  store: Store;
  onSave: (v: { theme: Theme; mode: Mode; compact: boolean }) => void;
  onClose: () => void;
}) {
  const [theme, setTheme] = useState(store.theme),
    [mode, setMode] = useState<Mode>(store.mode),
    [compact, setCompact] = useState(store.compact);
  useEffect(() => {
    const html = document.documentElement;
    const oldTheme = html.dataset.theme,
      oldMode = html.dataset.mode;
    html.dataset.theme = theme;
    html.dataset.mode =
      mode === 'system'
        ? matchMedia('(prefers-color-scheme:dark)').matches
          ? 'dark'
          : 'light'
        : mode;
    return () => {
      html.dataset.theme = oldTheme;
      html.dataset.mode = oldMode;
    };
  }, [theme, mode]);
  return (
    <Modal title="A space that feels like you." onClose={onClose} wide>
      <p className="muted">One connected workspace. Your choice of atmosphere.</p>
      <ThemeOptions theme={theme} onChange={setTheme} />
      <div className="setting-row">
        <div>
          <b>Appearance</b>
          <p>Light, dark or follow your device.</p>
        </div>
        <div className="segmented">
          {(
            [
              ['light', Sun],
              ['dark', Moon],
              ['system', Monitor],
            ] as const
          ).map(([m, I]) => (
            <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
              <I size={14} />
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="setting-row">
        <div>
          <b>Density</b>
          <p>Choose your breathing room.</p>
        </div>
        <div className="segmented">
          <button aria-pressed={!compact} onClick={() => setCompact(false)}>
            Comfortable
          </button>
          <button aria-pressed={compact} onClick={() => setCompact(true)}>
            Compact
          </button>
        </div>
      </div>
      <div className="modal-footer">
        <button className="button" onClick={onClose}>
          Cancel
        </button>
        <button className="button primary" onClick={() => onSave({ theme, mode, compact })}>
          Save appearance <Check size={15} />
        </button>
      </div>
    </Modal>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-mark">↗</div>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Status({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return (
    <span className={'status ' + tone}>
      <i />
      {children}
    </span>
  );
}
export function Steps({ active, onGo }: { active: string; onGo: (s: string) => void }) {
  return (
    <nav className="steps" aria-label="Project lifecycle">
      {['Plan', 'Build', 'Review', 'Release'].map((s, i) => (
        <div key={s}>
          <button
            className={s === active ? 'active' : ''}
            aria-current={s === active ? 'step' : undefined}
            onClick={() => onGo(s)}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            {s}
          </button>
          {i < 3 && <ChevronRight size={12} />}
        </div>
      ))}
    </nav>
  );
}
