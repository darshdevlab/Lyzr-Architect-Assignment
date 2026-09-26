import { useEffect, useState } from 'react';
import { auth } from '../lib/cloud';
import {
  accountTabs,
  accountTab,
  defaultPreferences,
  loadPreferences,
  persistPreferences,
  upsertSupportDraft,
  visibleNotifications,
  type Preferences,
} from '../lib/account-preferences';
type Props = {
  account: string;
  demo: boolean;
  canManage: boolean;
  onNavigate: (v: string) => void;
  initialTab?: string;
};
export default function AccountCenter(props: Props) {
  return <AccountContent key={props.account} {...props} />;
}
function AccountContent({ account, demo, canManage, onNavigate, initialTab }: Props) {
  const defaults = defaultPreferences();
  const [prefs, setPrefs] = useState<Preferences>(() => {
      try {
        return loadPreferences(localStorage, account);
      } catch {
        return defaultPreferences();
      }
    }),
    [tab, setTab] = useState(() => accountTab(initialTab)),
    [message, setMessage] = useState(''),
    [stage, setStage] = useState('Choose'),
    [pack, setPack] = useState('100 demo credits'),
    [status, setStatus] = useState<'Success' | 'Pending' | 'Failed'>('Success'),
    [filter, setFilter] = useState('Inbox'),
    [confirm, setConfirm] = useState(''),
    [security, setSecurity] = useState(''),
    [supportBody, setSupportBody] = useState(''),
    [supportId, setSupportId] = useState<string | undefined>(),
    [removeDraft, setRemoveDraft] = useState<string | undefined>();
  useEffect(() => {
    setTab(accountTab(initialTab));
    setMessage('');
  }, [initialTab]);
  function save(p: Preferences, notice = 'Personal preferences saved on this browser.') {
    try {
      const clean = persistPreferences(localStorage, account, p);
      setPrefs(clean);
      setMessage(notice);
      return true;
    } catch {
      setPrefs(p);
      setMessage(
        'Browser storage is unavailable. These changes are only in this open page; export them before leaving.',
      );
      return false;
    }
  }
  function download(value: unknown, name: string) {
    const href = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  const notices = visibleNotifications(prefs, filter);
  const ledgerTotal = prefs.ledger
    .filter((r) => r.status === 'Completed')
    .reduce((n, r) => n + r.amount, 0);
  return (
    <section className="panel account-center">
      <span className="eyebrow">YOUR ACCOUNT</span>
      <h2>A clear view of your workspace.</h2>
      <div className="segmented">
        {accountTabs.map((t) => (
          <button
            type="button"
            aria-pressed={tab === t}
            key={t}
            onClick={() => {
              setTab(t);
              setMessage('');
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Preferences' && (
        <>
          <div className="grid-two">
            <label>
              Language preference
              <select
                value={prefs.language}
                onChange={(e) => save({ ...prefs, language: e.target.value })}
              >
                {['English', 'Hindi'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Report timezone
              <input
                value={prefs.timezone}
                onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              />
            </label>
          </div>
          <p className="muted">
            The interface is currently English. Language is saved as a preference; translation is
            not connected.
          </p>
          <button
            type="button"
            className="button"
            onClick={() => {
              try {
                new Intl.DateTimeFormat('en', { timeZone: prefs.timezone }).format();
                save(prefs);
              } catch {
                setMessage('Enter a valid timezone, for example Asia/Kolkata.');
              }
            }}
          >
            Save timezone
          </button>
          <button
            type="button"
            className="button"
            onClick={() =>
              save({
                ...prefs,
                language: defaults.language,
                timezone: defaults.timezone,
                quiet: false,
              })
            }
          >
            Reset personal preferences
          </button>
          <p>Company roles and permissions are managed separately.</p>
          <button type="button" className="button" onClick={() => onNavigate('company-access')}>
            Open company membership
          </button>
        </>
      )}
      {tab === 'Notifications' && (
        <>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={prefs.quiet}
              onChange={(e) => save({ ...prefs, quiet: e.target.checked })}
            />
            Quiet mode for prototype reminders
          </label>
          <div className="segmented">
            {['Inbox', 'Unread', 'Archived'].map((f) => (
              <button
                type="button"
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="row">
            <span>
              {notices.length} {filter.toLowerCase()} notifications
            </span>
            <button
              type="button"
              className="button"
              disabled={!prefs.inbox.some((n) => !n.archived && !n.read)}
              onClick={() =>
                save(
                  {
                    ...prefs,
                    inbox: prefs.inbox.map((n) => (n.archived ? n : { ...n, read: true })),
                  },
                  'All inbox reminders marked read.',
                )
              }
            >
              Mark inbox read
            </button>
          </div>
          {!notices.length && (
            <div className="empty" role="status">
              <h3>
                {filter === 'Unread'
                  ? 'You’re all caught up.'
                  : filter === 'Archived'
                    ? 'No archived reminders.'
                    : 'Your inbox is clear.'}
              </h3>
              <p>
                {filter === 'Archived'
                  ? 'Archived reminders will appear here. You can restore them whenever you need.'
                  : 'There are no reminders in this view.'}
              </p>
              {filter !== 'Inbox' && (
                <button type="button" className="button" onClick={() => setFilter('Inbox')}>
                  View inbox
                </button>
              )}
            </div>
          )}
          {notices.map((n) => (
            <article className="setting-row" key={n.id}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.read ? 'Read' : 'Unread'}</p>
              </div>
              <div className="row">
                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    save({
                      ...prefs,
                      inbox: prefs.inbox.map((x) => (x.id === n.id ? { ...x, read: !x.read } : x)),
                    })
                  }
                >
                  {n.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    save({
                      ...prefs,
                      inbox: prefs.inbox.map((x) =>
                        x.id === n.id ? { ...x, archived: !x.archived } : x,
                      ),
                    })
                  }
                >
                  {n.archived ? 'Restore' : 'Archive'}
                </button>
              </div>
            </article>
          ))}
          <p className="muted">
            Local prototype reminders. External notification delivery is not connected.
          </p>
        </>
      )}
      {tab === 'Billing preview' && (
        <>
          <p className="notice">
            Billing demonstration. No payment details are collected, no money is charged and no live
            model credits are added.
          </p>
          <div className="grid-two">
            <div>
              <small>Actual workspace</small>
              <h3>Free prototype</h3>
              <p>OpenRouter provider usage remains separate.</p>
            </div>
            <div>
              <small>Demonstration ledger</small>
              <h3>{ledgerTotal} demo credits</h3>
              <p>Reserved: 0 · Expired: 0</p>
            </div>
          </div>
          <label>
            Plan preview
            <select
              disabled={!canManage}
              value={prefs.plan}
              onChange={(e) => save({ ...prefs, plan: e.target.value })}
            >
              {[
                'Free prototype',
                'Builder monthly · demonstration',
                'Company monthly · demonstration',
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <p>Changing this preview does not change an entitlement or subscription.</p>
          <div className="grid-two">
            <label>
              Credit pack
              <select
                disabled={!canManage}
                value={pack}
                onChange={(e) => {
                  setPack(e.target.value);
                  setStage('Choose');
                }}
              >
                {['100 demo credits', '500 demo credits'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Outcome to rehearse
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                {['Success', 'Pending', 'Failed'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          {stage === 'Choose' ? (
            <button
              type="button"
              className="button primary"
              disabled={!canManage}
              onClick={() => setStage('Review')}
            >
              Review demo purchase
            </button>
          ) : (
            <section className="panel">
              <h3>{pack}</h3>
              <p>Charge: $0.00 · Test credits only · No renewal · No payment method</p>
              <button
                type="button"
                className="button primary"
                disabled={!canManage}
                onClick={() => {
                  const result = status === 'Success' ? 'Completed' : status;
                  save({
                    ...prefs,
                    ledger: [
                      {
                        id: crypto.randomUUID(),
                        type: pack,
                        amount: parseInt(pack),
                        status: result,
                        at: new Date().toISOString(),
                      },
                      ...prefs.ledger,
                    ],
                  });
                  setStage('Choose');
                  setMessage('Recorded demonstration outcome: ' + result);
                }}
              >
                Confirm demonstration
              </button>
              <button type="button" className="button" onClick={() => setStage('Choose')}>
                Cancel
              </button>
            </section>
          )}
          <label className="toggle-field">
            <input
              disabled={!canManage}
              type="checkbox"
              checked={prefs.autoRecharge}
              onChange={(e) => save({ ...prefs, autoRecharge: e.target.checked })}
            />
            Preview opt-in recharge policy
          </label>
          {prefs.autoRecharge && (
            <label>
              Maximum demo credits per month
              <input
                disabled={!canManage}
                type="number"
                min="0"
                max="1000000"
                value={prefs.cap}
                onChange={(e) => save({ ...prefs, cap: Math.max(0, Number(e.target.value)) })}
              />
            </label>
          )}
          <h3>Demonstration transactions</h3>
          {!canManage && (
            <p className="notice">
              Your role can review billing demonstrations. An owner or administrator controls
              purchase and plan rehearsals.
            </p>
          )}
          {!prefs.ledger.length && (
            <p className="empty">
              No demonstration transactions yet. Review a demo purchase to rehearse its outcome.
            </p>
          )}
          {prefs.ledger.map((r) => (
            <div className="setting-row" key={r.id}>
              <div>
                <strong>{r.type}</strong>
                <p>
                  {r.status} · {new Date(r.at).toLocaleString()}
                </p>
              </div>
              {r.status !== 'Completed' && (
                <button
                  type="button"
                  className="button"
                  disabled={!canManage}
                  onClick={() =>
                    save({
                      ...prefs,
                      ledger: prefs.ledger.map((x) =>
                        x.id === r.id ? { ...x, status: 'Completed' } : x,
                      ),
                    })
                  }
                >
                  Reconcile demo success
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="button"
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    { prototype: true, currency: 'demo credits', ledger: prefs.ledger },
                    null,
                    2,
                  ),
                ],
                { type: 'application/json' },
              );
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'demo-credit-ledger.json';
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Export demo ledger
          </button>
        </>
      )}
      {tab === 'Security' && (
        <>
          <button
            type="button"
            className="button"
            disabled={demo}
            onClick={async () => {
              try {
                const info = await auth.securitySummary();
                setSecurity(
                  `${info.email} · ${info.emailVerified ? 'Verified email' : 'Email verification pending'} · Providers: ${info.providers.join(', ')} · Session expires ${new Date(info.expiresAt * 1000).toLocaleString()}`,
                );
              } catch (e) {
                setSecurity(e instanceof Error ? e.message : 'Could not load security summary.');
              }
            }}
          >
            Inspect current session
          </button>
          <button
            type="button"
            className="button"
            disabled={demo}
            onClick={() => setConfirm('REVOKE OTHER SESSIONS')}
          >
            Review other-session revocation
          </button>
          {confirm === 'REVOKE OTHER SESSIONS' && (
            <div className="notice">
              <p>
                This keeps this session signed in and revokes other refresh tokens. Existing access
                tokens can remain valid until expiry.
              </p>
              <button
                type="button"
                className="button"
                onClick={async () => {
                  try {
                    await auth.signOutOtherSessions();
                    setSecurity('Other refresh sessions revoked. Current session retained.');
                    setConfirm('');
                  } catch (e) {
                    setSecurity(e instanceof Error ? e.message : 'Could not revoke sessions.');
                  }
                }}
              >
                Confirm revoke other sessions
              </button>
              <button type="button" className="button" onClick={() => setConfirm('')}>
                Cancel
              </button>
            </div>
          )}
          <p>
            Company access is assigned by an owner or administrator. Choosing a view never grants a
            role.
          </p>
          <button type="button" className="button" onClick={() => onNavigate('company-access')}>
            Manage memberships and invitations
          </button>
          <p>
            Google authentication is provided through Supabase. Password recovery starts from the
            sign-in screen.
          </p>
          <label>
            Account closure rehearsal
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type PREVIEW CLOSURE"
            />
          </label>
          <button
            type="button"
            className="button"
            disabled={confirm !== 'PREVIEW CLOSURE'}
            onClick={() =>
              setSecurity(
                'Closure review: export projects, transfer company ownership, pause schedules, revoke connectors, review retention, then request deletion. This prototype does not delete the account.',
              )
            }
          >
            Review account closure
          </button>
          {security && (
            <p role="status" className="notice">
              {security}
            </p>
          )}
          <p className="muted">
            MFA, linked identities, SSO enforcement and account deletion require connected security
            workflows; no placeholder grants access.
          </p>
        </>
      )}
      {tab === 'Support' && (
        <>
          <p>
            Describe the affected project, the action and expected result. Exclude passwords, keys
            and customer data. Drafts are private to this account in this browser; they are not
            submitted to a support service.
          </p>
          <label>
            Support request
            <textarea
              maxLength={4000}
              value={supportBody}
              onChange={(e) => setSupportBody(e.target.value)}
              rows={4}
            />
          </label>
          <small>{supportBody.length}/4,000 characters</small>
          <div className="row">
            <button
              type="button"
              className="button"
              disabled={!supportBody.trim()}
              onClick={() => {
                try {
                  const result = upsertSupportDraft(prefs, supportBody, supportId);
                  save(
                    result.preferences,
                    'Support draft saved on this browser. No message was sent. Reference: ' +
                      result.draft.reference,
                  );
                  setSupportId(result.draft.id);
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : 'Could not save draft.');
                }
              }}
            >
              {supportId ? 'Update support draft' : 'Save support draft'}
            </button>
            <button
              type="button"
              className="button"
              disabled={!supportBody.trim()}
              onClick={() =>
                download(
                  {
                    prototype: true,
                    submitted: false,
                    reference: prefs.support.find((d) => d.id === supportId)?.reference || null,
                    body: supportBody,
                  },
                  'support-draft.json',
                )
              }
            >
              Export current draft
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                setSupportId(undefined);
                setSupportBody('');
                setMessage('Started a new, unsaved draft.');
              }}
            >
              New draft
            </button>
            <button type="button" className="button" onClick={() => onNavigate('help')}>
              Open help
            </button>
          </div>
          <h3>Saved support drafts</h3>
          {!prefs.support.length && (
            <p className="empty">
              No saved support drafts. Save a description above to create a reference you can reopen
              after reloading.
            </p>
          )}
          {prefs.support.map((d) => (
            <article className="setting-row" key={d.id}>
              <div>
                <strong>{d.reference}</strong>
                <p>
                  {d.body.slice(0, 160)}
                  {d.body.length > 160 ? '…' : ''}
                </p>
                <small>Local draft · Updated {new Date(d.updatedAt).toLocaleString()}</small>
              </div>
              <div className="row">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setSupportBody(d.body);
                    setSupportId(d.id);
                    setMessage('Editing ' + d.reference);
                  }}
                >
                  Reopen
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => download({ ...d, submitted: false }, d.reference + '.json')}
                >
                  Export
                </button>
                <button type="button" className="button" onClick={() => setRemoveDraft(d.id)}>
                  Remove
                </button>
              </div>
              {removeDraft === d.id && (
                <div className="notice">
                  <p>Remove this local draft? Export a copy first if you want to keep it.</p>
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      if (
                        save(
                          { ...prefs, support: prefs.support.filter((x) => x.id !== d.id) },
                          'Local support draft removed.',
                        )
                      ) {
                        setRemoveDraft(undefined);
                        if (supportId === d.id) {
                          setSupportId(undefined);
                          setSupportBody('');
                        }
                      }
                    }}
                  >
                    Confirm remove
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setRemoveDraft(undefined)}
                  >
                    Keep draft
                  </button>
                </div>
              )}
            </article>
          ))}
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
