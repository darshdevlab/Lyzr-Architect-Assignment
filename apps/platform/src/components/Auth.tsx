import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { Brand, GoogleMark } from './Brand';
import { EDITION } from '../lib/edition';
import { Sun, Moon } from 'lucide-react';
import { auth, configured, type CloudUser } from '../lib/cloud';
export function Auth({
  onDemo,
  onAuthenticated,
  isDark,
  onToggleAppearance,
}: {
  onDemo: () => void;
  onAuthenticated: (user: CloudUser) => void;
  isDark?: boolean;
  onToggleAppearance?: () => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'recovery' | 'resend'>(
    new URLSearchParams(location.search).has('recovery') ? 'recovery' : 'signin',
  );
  const [entry, setEntry] = useState<'individual' | 'company'>(() => {
    const company =
      EDITION !== 2 ||
      new URLSearchParams(location.search).has('join') ||
      !!sessionStorage.getItem('architect.pendingInvite') ||
      ['company', 'employee'].includes(sessionStorage.getItem('architect.entry') || '');
    const next = company ? 'company' : 'individual';
    sessionStorage.setItem('architect.entry', next);
    return next;
  });
  const dark = isDark ?? document.documentElement.dataset.mode === 'dark';
  const [sentAt, setSentAt] = useState(0);
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [name, setName] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    auth
      .getUser()
      .then((u) => {
        if (live && u && !new URLSearchParams(location.search).has('recovery')) onAuthenticated(u);
        else if (live && new URLSearchParams(location.search).has('recovery')) setMode('recovery');
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  function change(next: typeof mode) {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'resend') {
        if (Date.now() - sentAt < 60000)
          throw new Error('Please wait one minute before requesting another confirmation email.');
        await auth.resendConfirmation(email);
        setSentAt(Date.now());
        setNotice(
          'If your account needs confirmation, a new link will arrive by email. Check spam too.',
        );
      } else if (mode === 'reset') {
        await auth.resetPassword(email);
        setNotice('If this account exists, a recovery link will arrive by email.');
      } else if (mode === 'recovery') {
        await auth.updatePassword(password);
        const destination = new URL(location.href);
        destination.searchParams.delete('recovery');
        history.replaceState({}, '', destination.pathname + destination.search + destination.hash);
        const u = await auth.getUser();
        if (u) onAuthenticated(u);
      } else {
        const u =
          mode === 'signin'
            ? await auth.signIn(email, password)
            : await auth.signUp(email, password, name);
        if (u) onAuthenticated(u);
        else setNotice('Check your email to confirm your account, then sign in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <button
        className="mode-toggle auth-theme-button"
        onClick={onToggleAppearance}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
        {dark ? 'Light' : 'Dark'}
      </button>
      <section className="auth-story">
        <a className="brand" href="/" aria-label="Architect home">
          <Brand />
        </a>
        <div>
          <span className="eyebrow">A WORKSPACE FOR WHAT’S NEXT</span>
          <h1>
            {EDITION === 2 ? (
              <>
                Your idea.
                <br />A working reality.
              </>
            ) : EDITION === 3 ? (
              <>
                One company.
                <br />
                Shared momentum.
              </>
            ) : (
              <>
                Your platform.
                <br />
                On your terms.
              </>
            )}
          </h1>
          <p>
            Think it through. Build with agents. Review every detail. Take your next idea all the
            way.
          </p>
          <div className="auth-orbit" aria-hidden="true">
            <div>
              <Sparkles size={32} />
              <span>Idea</span>
            </div>
            <i />
            <div>
              <Layers size={32} />
              <span>Build</span>
            </div>
            <i />
            <div>
              <ShieldCheck size={32} />
              <span>Ship</span>
            </div>
          </div>
        </div>
        <small>One workspace. From first thought to first release.</small>
      </section>
      <main className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">INDEPENDENT HIRING PROTOTYPE</span>
          <h2>
            {mode === 'signup'
              ? 'Start your next chapter.'
              : mode === 'resend'
                ? 'Confirm your email.'
                : mode === 'reset'
                  ? 'Let’s get you back in.'
                  : mode === 'recovery'
                    ? 'Choose a new password.'
                    : 'Welcome back.'}
          </h2>
          <p>
            {mode === 'signup'
              ? 'A home for your ideas, code, and agents.'
              : 'Pick up where your last good idea left off.'}
          </p>
          {(mode === 'signin' || mode === 'signup') && (
            <>
              {EDITION === 2 && (
                <div className="auth-entry" aria-label="Workspace type">
                  {[
                    ['individual', 'Personal workspace'],
                    ['company', 'Company workspace'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={entry === id}
                      onClick={() => {
                        setEntry(id as typeof entry);
                        sessionStorage.setItem('architect.entry', id);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <p className="auth-note">
                {entry === 'company'
                  ? 'Sign in to this prototype with your work email. Your membership determines your role; use the invited email when joining a team.'
                  : 'A personal space for your projects, code and agents.'}
              </p>
              <button
                className="google-button"
                disabled={busy || !configured}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await auth.signInWithGoogle();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Google sign-in failed.');
                    setBusy(false);
                  }
                }}
              >
                <GoogleMark /> Continue with Google
              </button>
              <div className="auth-divider">
                <span>or use your email</span>
              </div>
            </>
          )}
          <form onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </label>
            )}
            {mode !== 'recovery' && (
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {mode !== 'reset' && mode !== 'resend' && (
              <label>
                Password
                <input
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={mode === 'signin' ? 1 : 8}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' ? 'Your password' : 'At least 8 characters'}
                  required
                />
              </label>
            )}
            {mode === 'signin' && (
              <button className="text-button" type="button" onClick={() => change('reset')}>
                Forgot password?
              </button>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="form-success" role="status">
                {notice}
              </p>
            )}
            <button className="primary" disabled={busy || !configured}>
              {busy
                ? 'One moment…'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'resend'
                    ? 'Resend confirmation'
                    : mode === 'reset'
                      ? 'Send recovery link'
                      : mode === 'recovery'
                        ? 'Update password'
                        : 'Sign in'}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-switch">
            {mode === 'signin' ? (
              <>
                {EDITION !== 4 && (
                  <>
                    New here? <button onClick={() => change('signup')}>Create an account</button>
                    <br />
                  </>
                )}
                <button onClick={() => change('resend')}>Resend confirmation email</button>
                {EDITION === 4 && (
                  <small>Company setup and access are available after sign-in.</small>
                )}
              </>
            ) : (
              <button onClick={() => change('signin')}>Back to sign in</button>
            )}
          </p>
          <button className="demo-button" onClick={onDemo} disabled={busy}>
            Explore the demo <ArrowRight size={16} />
          </button>
          <small className="auth-note">
            Independent hiring prototype by Darsh Dave. Not the official Lyzr service.
          </small>
          <a className="auth-note-link" href="/privacy.html">
            How this prototype handles your data
          </a>
          <small className="auth-note">
            Demo projects stay in this browser. Sign in for cloud storage and live AI.
          </small>
          {!configured && (
            <p role="status">
              Cloud authentication is being configured. The interactive demo is ready.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
export default Auth;
