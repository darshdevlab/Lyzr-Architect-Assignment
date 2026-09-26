import { useState } from 'react';
import { Cloud, Server, Network, Check, ArrowRight, Shield, UserPlus } from 'lucide-react';
import type { Store } from '../lib/model';
import { uid } from '../lib/model';
import { PageTitle, Modal, Status } from './UI';
export function Infrastructure({
  value,
  onSave,
}: {
  value: Store['infra'];
  onSave: (v: Store['infra']) => void;
}) {
  const [draft, setDraft] = useState(value),
    [step, setStep] = useState(0),
    [saved, setSaved] = useState(false);
  const choices = [
    [
      'Architect managed',
      Cloud,
      'Start quickly',
      'The platform and workers run in managed environments.',
    ],
    [
      'Your cloud',
      Network,
      'Use your infrastructure',
      'Keep the workspace hosted; run workloads in your cloud.',
    ],
    [
      'Private installation',
      Server,
      'Operate Architect privately',
      'Install the platform and execution services in your environment.',
    ],
  ] as const;
  return (
    <>
      <PageTitle
        eyebrow="Infrastructure"
        title="Run where your company needs you."
        description="Choose the platform location separately from your apps and execution environments."
      >
        <Status>Draft configuration</Status>
      </PageTitle>
      <div className="settings-layout">
        <section className="panel settings-panel">
          <nav className="steps">
            {['Placement', 'Environment', 'Review'].map((x, i) => (
              <button className={step === i ? 'active' : ''} key={x} onClick={() => setStep(i)}>
                <span>0{i + 1}</span>
                {x}
              </button>
            ))}
          </nav>
          {step === 0 ? (
            <>
              <h2>Where should the work run?</h2>
              <p className="muted">
                Choose an operating model. Each environment will have its own permissions.
              </p>
              <div className="placement-options">
                {choices.map(([placement, I, title, text]) => (
                  <button
                    key={placement}
                    className={'placement ' + (draft.placement === placement ? 'selected' : '')}
                    aria-pressed={draft.placement === placement}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        placement,
                        runtime:
                          placement === 'Architect managed'
                            ? 'Managed runner'
                            : 'Private VM runner',
                      })
                    }
                  >
                    <div className="placement-icon">
                      <I size={21} />
                    </div>
                    <div>
                      <span className="eyebrow">{placement}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                    {draft.placement === placement && <Check size={18} />}
                  </button>
                ))}
              </div>
            </>
          ) : step === 1 ? (
            <>
              <h2>Give the environment clear boundaries.</h2>
              {draft.placement !== 'Architect managed' && (
                <label>
                  Cloud provider
                  <select
                    value={draft.provider}
                    onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
                  >
                    {['AWS', 'Azure', 'GCP'].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Execution runtime
                <select
                  value={draft.runtime}
                  onChange={(e) => setDraft({ ...draft, runtime: e.target.value })}
                >
                  {(draft.placement === 'Architect managed'
                    ? ['Managed runner']
                    : [
                        'Private VM runner',
                        'Private Kubernetes runner',
                        'Approved container runtime',
                      ]
                  ).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Approved region
                <input
                  value={draft.region}
                  onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                />
              </label>
              <label>
                Sandbox expiry
                <select
                  value={draft.expiry}
                  onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
                >
                  {['2 hours', '8 hours', '24 hours'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <div className="notice">
                Actual connection checks include scoped identity, private networking, DNS, registry
                access and approved model endpoints. No credentials are collected in this build.
              </div>
            </>
          ) : (
            <>
              <h2>Review before you connect.</h2>
              <dl className="summary-list">
                {Object.entries(draft).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="notice">
                Saving creates a local configuration draft. It does not provision cloud resources or
                install Architect. Private installation artifacts and provider integrations are
                pending.
              </div>
              {saved && (
                <p className="success" role="status">
                  ✓ Infrastructure draft saved.
                </p>
              )}
            </>
          )}
          <div className="modal-footer">
            <button className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else {
                  onSave(draft);
                  setSaved(true);
                }
              }}
            >
              {step < 2 ? 'Continue' : 'Save draft'}
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
        <aside className="settings-aside">
          <Shield size={24} />
          <h3>Three boundaries. One clear picture.</h3>
          <p>
            <strong>Platform</strong>
            <br />
            Identity, plans, prompts and orchestration.
          </p>
          <p>
            <strong>Execution</strong>
            <br />
            Builds, sandbox tasks and agent runs.
          </p>
          <p>
            <strong>Application</strong>
            <br />
            Your published app and its state.
          </p>
          <div className="notice">
            A private worker does not automatically make your control plane, logs or model calls
            private.
          </div>
        </aside>
      </div>
    </>
  );
}
export function People({
  members,
  onChange,
}: {
  members: Store['members'];
  onChange: (m: Store['members']) => void;
}) {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(''),
    [role, setRole] = useState('Developer'),
    [scope, setScope] = useState('Customer portal');
  return (
    <>
      <PageTitle
        eyebrow="Company & workspace"
        title="People, with the right permissions."
        description="Use explicit roles and resource scopes. A reporting line does not automatically grant access."
      >
        <button className="button primary" onClick={() => setOpen(true)}>
          <UserPlus size={16} />
          Draft member access
        </button>
      </PageTitle>
      <div className="notice">
        Local access planning. These records do not invite people, authenticate accounts or enforce
        permissions.
      </div>
      <section className="panel">
        <div className="table-head">
          <span>Member</span>
          <span>Role</span>
          <span>Scope</span>
          <span>Status</span>
        </div>
        {members.length ? (
          members.map((m) => (
            <div className="table-row" key={m.id}>
              <b>{m.name}</b>
              <span>{m.role}</span>
              <span>{m.scope}</span>
              <button
                className="text-button"
                onClick={() => onChange(members.filter((x) => x.id !== m.id))}
              >
                Remove draft
              </button>
            </div>
          ))
        ) : (
          <div className="empty small-empty">
            <h3>No member access drafts yet.</h3>
            <p>Define roles before you connect an identity provider.</p>
          </div>
        )}
      </section>
      {open && (
        <Modal title="Preview a member’s access" onClose={() => setOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onChange([...members, { id: uid(), name: name.trim(), role, scope: scope.trim() }]);
              setOpen(false);
              setName('');
            }}
          >
            <label>
              Member name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {[
                  'Workspace administrator',
                  'Department manager',
                  'Product manager',
                  'Developer',
                  'QA reviewer',
                  'Release operator',
                  'Infrastructure administrator',
                  'Viewer',
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Resource / project scope
              <input
                required
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                maxLength={100}
              />
            </label>
            <div className="notice">
              <b>{role}</b> · Limited to {scope || 'a selected scope'}. Production deployment, raw
              secrets, exports and company-wide administration require separate permissions.
            </div>
            <div className="modal-footer">
              <button className="button" type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="button primary">Save access draft</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
