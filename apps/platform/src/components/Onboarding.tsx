import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, User, Users } from 'lucide-react';
import { ThemeOptions } from './UI';
import type { Theme, Store } from '../lib/model';
export default function Onboarding({
  onComplete,
}: {
  onComplete: (profile: NonNullable<Store['profile']>, theme: Theme, sample: boolean) => void;
}) {
  const [step, setStep] = useState(0),
    [name, setName] = useState('Darsh'),
    [workspace, setWorkspace] = useState(''),
    [kind, setKind] = useState<'personal' | 'company'>('personal'),
    [theme, setTheme] = useState<Theme>('atelier');
  return (
    <div className="onboarding">
      <aside className="welcome-art">
        <div className="brand">
          <span className="brand-symbol">A</span>architect <sup>2.0</sup>
        </div>
        <div>
          <div className="eyebrow">Ideas become outcomes</div>
          <h1>
            One place.
            <br />
            Every next step.
          </h1>
          <p>
            Bring your ideas, your people and your agents together. Make something that matters.
          </p>
          <div className="welcome-path">
            Imagine <span>→</span> Build <span>→</span> Improve
          </div>
        </div>
        <span className="tiny">Your work, connected.</span>
        <div className="welcome-lines" />
      </aside>
      <main className="welcome-main">
        <div className="welcome-meta">
          <span>WORKSPACE SETUP</span>
          <span>0{step + 1} / 02</span>
        </div>
        {step === 0 ? (
          <>
            <h2>A good place to start.</h2>
            <p className="muted">Set up your local workspace. You can bring in your team later.</p>
            <div className="notice">
              Local build preview · No account is created. Your work is saved in this browser.
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
            >
              <label>
                Your name
                <input
                  required
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <div className="choice-grid">
                {(
                  [
                    ['personal', User, 'Just me', 'An idea and a place to build.'],
                    ['company', Users, 'My team', 'A shared direction for your company.'],
                  ] as const
                ).map(([k, I, t, d]) => (
                  <button
                    type="button"
                    key={k}
                    className={'choice ' + (kind === k ? 'selected' : '')}
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                  >
                    <I size={22} />
                    <b>{t}</b>
                    <small>{d}</small>
                    {kind === k && <Check className="selected-check" size={15} />}
                  </button>
                ))}
              </div>
              <label>
                {kind === 'company' ? 'Company / workspace name' : 'Workspace name'}
                <input
                  required
                  maxLength={80}
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder={kind === 'company' ? 'e.g. Meridian' : 'e.g. Darsh’s workspace'}
                />
              </label>
              <button className="button primary full" type="submit">
                Continue <ArrowRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Make yourself at home.</h2>
            <p className="muted">Choose an atmosphere. You can change it anytime.</p>
            <ThemeOptions theme={theme} onChange={setTheme} />
            <div className="welcome-actions">
              <button className="button" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                className="button primary"
                onClick={() =>
                  onComplete({ name: name.trim(), workspace: workspace.trim(), kind }, theme, false)
                }
              >
                Enter my workspace <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
        <button
          className="text-button welcome-sample"
          onClick={() =>
            onComplete(
              { name: name.trim() || 'Darsh', workspace: workspace.trim() || 'Meridian', kind },
              theme,
              true,
            )
          }
        >
          Explore with a sample project <ArrowUpRight size={15} />
        </button>
      </main>
    </div>
  );
}
