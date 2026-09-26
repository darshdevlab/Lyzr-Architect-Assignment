import { useEffect, useState, useRef } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  ArrowRight,
  Copy,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import {
  createCompany,
  listCompanies,
  getCompany,
  listMembers,
  listInvites,
  createInvite,
  acceptInvite,
  revokeInvite,
  updateMemberRole,
  removeMember,
  pendingInvite,
  parseInvite,
  companyRoles,
  roleLabels,
  type CompanySummary,
  type CompanyMember,
  type CompanyInvite,
  type CompanyRole,
} from '../lib/company';
export interface CompanyAccessProps {
  userEmail?: string;
  onSelect: (company: CompanySummary) => void;
  onClose?: () => void;
  initialCompanyId?: string;
}
export function CompanyAccess({
  userEmail,
  onSelect,
  onClose,
  initialCompanyId,
}: CompanyAccessProps) {
  const openEpoch = useRef(0);
  const [companies, setCompanies] = useState<CompanySummary[]>([]),
    [selected, setSelected] = useState<CompanySummary | null>(null),
    [members, setMembers] = useState<CompanyMember[]>([]),
    [invites, setInvites] = useState<CompanyInvite[]>([]),
    [tab, setTab] = useState<'companies' | 'create' | 'join'>('companies'),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [role, setRole] = useState<Exclude<CompanyRole, 'owner'>>('developer'),
    [joinValue, setJoinValue] = useState(() => pendingInvite() || ''),
    [link, setLink] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [confirmRemove, setConfirmRemove] = useState<CompanyMember | null>(null);
  async function refresh() {
    const items = await listCompanies();
    setCompanies(items);
    return items;
  }
  async function open(company: CompanySummary) {
    const epoch = ++openEpoch.current;
    setError('');
    setLink('');
    setLoading(true);
    try {
      const current = await getCompany(company.id);
      const roster = await listMembers(company.id);
      const invitations = current.canManage ? await listInvites(company.id) : [];
      if (epoch !== openEpoch.current) return;
      setSelected(current);
      setMembers(roster);
      setInvites(invitations);
    } catch (e) {
      if (epoch === openEpoch.current)
        setError(e instanceof Error ? e.message : 'Could not open company.');
    } finally {
      if (epoch === openEpoch.current) setLoading(false);
    }
  }
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const items = await listCompanies();
        if (!live) return;
        setCompanies(items);
        if (pendingInvite()) {
          setSelected(null);
          setTab('join');
        } else if (initialCompanyId) {
          const current = items.find((c) => c.id === initialCompanyId);
          if (current) await open(current);
        }
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Could not load companies.');
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
      openEpoch.current++;
    };
  }, [initialCompanyId]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The request could not be completed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="company-access">
      <div className="row between">
        <div>
          <span className="eyebrow">YOUR COMPANY, CONNECTED</span>
          <h2>{selected ? selected.name : 'Bring your people and projects together.'}</h2>
        </div>
        {onClose && (
          <button className="icon-button" aria-label="Close company access" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>
      <p className="muted">
        Signed in as <strong>{userEmail || 'your verified account'}</strong>. Company access
        requires an invitation or a company you create.
      </p>
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
      {!selected ? (
        <>
          <div className="segmented" aria-label="Company entry">
            {[
              ['companies', 'My companies'],
              ['create', 'Create a company'],
              ['join', 'Accept invitation'],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={tab === id}
                onClick={() => {
                  setTab(id as typeof tab);
                  setError('');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'companies' && (
            <div className="action-stack">
              {loading ? (
                <p role="status">Loading your companies…</p>
              ) : companies.length ? (
                companies.map((c) => (
                  <div className="panel" key={c.id}>
                    <div className="row between">
                      <div className="row">
                        <Building2 size={22} />
                        <div>
                          <h3>{c.name}</h3>
                          <p>
                            {roleLabels[c.role]} ·{' '}
                            {c.canWrite ? 'Contributor access' : 'Read-only access'}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <button className="button" onClick={() => void open(c)}>
                          People & access
                        </button>
                        <button className="button primary" onClick={() => onSelect(c)}>
                          Open workspace <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <Users size={28} />
                  <h3>A place for your whole team.</h3>
                  <p>Create your company or paste the invitation link from your administrator.</p>
                  <button className="button primary" onClick={() => setTab('create')}>
                    Create a company
                  </button>
                </div>
              )}
              <button
                className="text-button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await refresh();
                    setNotice('Company list refreshed.');
                  })
                }
              >
                <RefreshCw size={14} />
                Refresh companies
              </button>
            </div>
          )}
          {tab === 'create' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const c = await createCompany(name);
                  await refresh();
                  await open(c);
                  setNotice(
                    'Company created. You are the owner. Add your team with secure invitations.',
                  );
                  setName('');
                });
              }}
            >
              <label>
                Company name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="Your company"
                />
              </label>
              <div className="notice">
                <ShieldCheck size={17} />
                <span>
                  You become the owner. You can invite people, assign roles and manage access. No
                  one joins automatically by email domain.
                </span>
              </div>
              <button className="button primary" disabled={busy || loading}>
                {busy ? 'Creating…' : 'Create company workspace'}
                <Plus size={16} />
              </button>
            </form>
          )}
          {tab === 'join' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const c = await acceptInvite(parseInvite(joinValue));
                  await refresh();
                  setNotice('Invitation accepted. Your company workspace is ready.');
                  setJoinValue('');
                  onSelect(c);
                });
              }}
            >
              <label>
                Invitation link
                <textarea
                  required
                  value={joinValue}
                  onChange={(e) => setJoinValue(e.target.value)}
                  placeholder="Paste the link your administrator shared"
                  rows={3}
                />
              </label>
              <p className="notice">
                Use the same verified email address named on the invitation. Links expire after
                seven days and can be used once. Ask your administrator for a new link if it has
                expired.
              </p>
              <button className="button primary" disabled={busy}>
                {busy ? 'Checking invitation…' : 'Accept invitation'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <div className="row between">
            <button
              className="text-button"
              onClick={() => {
                setSelected(null);
                setLink('');
                setConfirmRemove(null);
              }}
            >
              ← All companies
            </button>
            <button className="button primary" onClick={() => onSelect(selected)}>
              Open shared workspace <ArrowRight size={16} />
            </button>
          </div>
          <p className="notice">
            Your role: <strong>{roleLabels[selected.role]}</strong>. Owners and administrators
            manage access. All other roles contribute to shared work, except Viewers. Department
            views personalize the interface; field-level department restrictions are not enforced in
            this prototype.
          </p>
          <h3>
            People <small>({members.length})</small>
          </h3>
          <div className="action-stack">
            {members.map((m) => (
              <div className="setting-row" key={m.userId}>
                <div>
                  <strong>{m.name || m.email}</strong>
                  <p>{m.email}</p>
                </div>
                <div className="row">
                  {selected.canManage ? (
                    <select
                      aria-label={'Role for ' + m.email}
                      value={m.role}
                      disabled={
                        busy || (selected.role !== 'owner' && ['owner', 'admin'].includes(m.role))
                      }
                      onChange={(e) => {
                        const next = e.target.value as CompanyRole;
                        void run(async () => {
                          await updateMemberRole(selected.id, m.userId, next);
                          await open(selected);
                          await refresh();
                          setNotice('Member role updated.');
                        });
                      }}
                    >
                      {companyRoles
                        .filter(
                          (r) =>
                            selected.role === 'owner' ||
                            !['owner', 'admin'].includes(r) ||
                            r === m.role,
                        )
                        .map((r) => (
                          <option value={r} key={r}>
                            {roleLabels[r]}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <span>{roleLabels[m.role]}</span>
                  )}
                  {selected.canManage && (
                    <button
                      className="icon-button"
                      disabled={
                        busy || (selected.role !== 'owner' && ['owner', 'admin'].includes(m.role))
                      }
                      aria-label={'Remove ' + m.email}
                      onClick={() => setConfirmRemove(m)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {confirmRemove && (
            <div className="panel">
              <h3>Remove {confirmRemove.name || confirmRemove.email}?</h3>
              <p>
                They will lose access to this shared company workspace. Their personal workspace
                remains separate.
              </p>
              <div className="row">
                <button className="button" onClick={() => setConfirmRemove(null)}>
                  Keep member
                </button>
                <button
                  className="button danger"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await removeMember(selected.id, confirmRemove.userId);
                      setConfirmRemove(null);
                      await open(selected);
                      await refresh();
                      setNotice('Company access removed.');
                    })
                  }
                >
                  Remove access
                </button>
              </div>
            </div>
          )}
          {selected.canManage && (
            <>
              <h3>Invite an employee</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const invite = await createInvite(selected.id, email, role);
                    setLink(invite.inviteUrl);
                    setInvites(await listInvites(selected.id));
                    setEmail('');
                    setNotice(
                      'Invitation created. Copy and share the link with the intended employee; no email was sent.',
                    );
                  });
                }}
              >
                <div className="grid-two">
                  <label>
                    Employee email
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@company.com"
                    />
                  </label>
                  <label>
                    Company role
                    <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                      {companyRoles
                        .filter(
                          (r) => r !== 'owner' && (selected.role === 'owner' || r !== 'admin'),
                        )
                        .map((r) => (
                          <option value={r} key={r}>
                            {roleLabels[r]}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <button className="button primary" disabled={busy}>
                  <UserPlus size={16} />
                  {busy ? 'Creating invitation…' : 'Create secure invitation'}
                </button>
              </form>
              {link && (
                <div className="panel">
                  <label>
                    Single-use invitation link
                    <input readOnly value={link} onFocus={(e) => e.target.select()} />
                  </label>
                  <button
                    className="button"
                    onClick={() =>
                      void run(async () => {
                        await navigator.clipboard.writeText(link);
                        setNotice(
                          'Invitation link copied. Share it only with the intended employee.',
                        );
                      })
                    }
                  >
                    <Copy size={15} />
                    Copy invitation link
                  </button>
                  <p className="tiny muted">
                    This link is shown only now. Create a replacement if you lose it.
                  </p>
                </div>
              )}
              <h3>Invitations</h3>
              {!invites.length ? (
                <p className="muted">No invitations yet.</p>
              ) : (
                invites.map((i) => (
                  <div className="setting-row" key={i.id}>
                    <div>
                      <strong>{i.email}</strong>
                      <p>
                        {roleLabels[i.role]} · {i.status} · Expires{' '}
                        {new Date(i.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    {i.status === 'Pending' && (
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await revokeInvite(selected.id, i.id);
                            setInvites(await listInvites(selected.id));
                            setLink('');
                            setNotice('Invitation revoked.');
                          })
                        }
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
      <div className="notice subtle">
        <ShieldCheck size={16} />
        <span>
          Enterprise SSO, domain enforcement, directory provisioning and private-company deployment
          are configuration prototypes. Google and verified-email account access, membership checks
          and shared project storage work here.
        </span>
      </div>
    </section>
  );
}
export default CompanyAccess;
