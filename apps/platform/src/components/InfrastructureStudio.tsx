import { useState } from 'react';
import {
  Cloud,
  Server,
  ShieldCheck,
  ArrowRight,
  Download,
  Check,
  Database,
  Network,
  RotateCcw,
  Box,
  Lock,
  GitBranch,
} from 'lucide-react';
import type { Store } from '../lib/model';
import {
  infraDefaults,
  normalizeInfrastructure,
  validateInfrastructure,
  deploymentBundle,
  infrastructureFlows,
  type InfrastructurePlan,
} from '../lib/infrastructure';
import { download } from './Studio';
import './infrastructure.css';
import PrivateLifecycle from './PrivateLifecycle';
const stages = ['Placement', 'Identity', 'Network', 'Runtime', 'Review', 'Install', 'Operate'];
const areaLabels: Record<string, string> = {
  infrastructure: 'Your infrastructure. Your rules.',
  connections: 'A trusted connection starts small.',
  runners: 'Make room for safe execution.',
  installation: 'Bring Architect closer to your work.',
  governance: 'Control is a product feature.',
  recovery: 'The way back is part of the plan.',
};
export default function InfrastructureStudio({
  area,
  store,
  onChange,
  onNavigate,
  notify,
  readOnly = false,
}: {
  readOnly?: boolean;
  area: string;
  store: Store;
  onChange: (s: Store) => void;
  onNavigate: (v: string) => void;
  notify: (s: string) => void;
}) {
  const existing = (store as Store & { infrastructure?: InfrastructurePlan }).infrastructure;
  const [plan, setPlan] = useState<InfrastructurePlan>(() => normalizeInfrastructure(existing)),
    [step, setStep] = useState(0),
    [issues, setIssues] = useState<string[]>([]),
    [checked, setChecked] = useState(false),
    [tab, setTab] = useState('Overview');
  const patch = (key: keyof InfrastructurePlan, value: unknown) => {
    if (readOnly) {
      notify('Your Viewer membership is read-only.');
      return;
    }
    setPlan((p) => ({ ...p, [key]: value }));
    setChecked(false);
  };
  const save = (action: string) => {
    if (readOnly) {
      notify('Your Viewer membership is read-only. No changes saved.');
      return;
    }
    const next = {
      ...plan,
      events: [{ at: new Date().toISOString(), action }, ...plan.events].slice(0, 30),
    };
    setPlan(next);
    onChange({ ...store, infrastructure: next } as Store);
    notify(action + ' saved with this workspace.');
  };
  const field = (label: string, key: keyof InfrastructurePlan, options?: string[]) => (
    <label className="field">
      {label}
      {options ? (
        <select
          disabled={readOnly}
          value={String(plan[key])}
          onChange={(e) => patch(key, e.target.value)}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          disabled={readOnly}
          value={String(plan[key])}
          onChange={(e) => patch(key, e.target.value)}
          placeholder={
            key === 'identity'
              ? 'arn:aws:iam::…:role/architect-runner'
              : key === 'network'
                ? 'vpc-… / vnet / network ID'
                : ''
          }
        />
      )}
    </label>
  );
  return (
    <div className="infrastructure-studio">
      <header className="page-title">
        <div>
          <span className="eyebrow">ARCHITECT 4.0 / PRIVATE PLATFORM</span>
          <h1>{areaLabels[area]}</h1>
          <p>
            A company control plane with deliberate boundaries. Plan the environment, inspect the
            permissions, and keep delivery connected.
          </p>
        </div>
        <button
          className="button"
          onClick={() =>
            download(
              'architect-private-plan.json',
              JSON.stringify(deploymentBundle(plan), null, 2),
              'application/json',
            )
          }
        >
          <Download size={16} />
          Export plan
        </button>
      </header>
      <div className="infra-placement">
        <div>
          <Cloud />
          <span>{plan.controlPlane || 'Company cloud · planned'}</span>
          <small>Control-plane placement</small>
        </div>
        <i />
        <div>
          <ShieldCheck />
          <span>Company policy</span>
          <small>Identity · Network · Budget</small>
        </div>
        <i />
        <div>
          <Server />
          <span>{plan.placement}</span>
          <small>
            {plan.provider} · {plan.runtime}
          </small>
        </div>
      </div>
      <div className="notice">
        <Lock size={16} />
        Infrastructure planning prototype. No cloud account is connected, no resources are
        provisioned, and no billable action is performed by these controls.
      </div>
      <PrivateLifecycle
        plan={plan}
        projects={store.projects}
        readOnly={readOnly}
        onChange={(next) => {
          if (readOnly) return;
          setPlan(next);
          onChange({ ...store, infrastructure: next });
        }}
      />
      <div className="segmented">
        {['Overview', 'Guided setup', 'Activity'].map((t) => (
          <button aria-pressed={tab === t} key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Activity' ? (
        <section className="panel">
          <h2>A record of the decisions.</h2>
          {plan.events.length ? (
            plan.events.map((e, i) => (
              <div className="setting-row" key={i}>
                <span>{e.action}</span>
                <small>{new Date(e.at).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p>No environment decisions yet. Start with guided setup.</p>
          )}
        </section>
      ) : tab === 'Guided setup' ? (
        <section className="panel infra-wizard">
          <div className="infra-steps">
            {stages.map((s, i) => (
              <button key={s} className={step === i ? 'active' : ''} onClick={() => setStep(i)}>
                <span>{i + 1}</span>
                {s}
              </button>
            ))}
          </div>
          <h2>{stages[step]}</h2>
          {step === 0 && (
            <>
              <p>Choose who operates the platform and where application execution happens.</p>
              <div className="grid-two">
                {field('Environment name', 'name')}
                {field('Placement', 'placement', [
                  'Architect managed',
                  'Bring your cloud',
                  'Hybrid private runners',
                  'On-premises',
                ])}
                {field('Cloud provider', 'provider', ['AWS', 'Azure', 'GCP', 'On-premises'])}
                {field('Region', 'region')}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p>
                Use an IAM role, workload identity or service account reference. Never paste access
                keys into this prototype.
              </p>
              {field('Scoped identity reference', 'identity')}
              <div className="infra-permissions">
                {[
                  'Read inventory',
                  'Create approved sandbox',
                  'Read runner health',
                  'Write deployment logs',
                ].map((s) => (
                  <span key={s}>
                    <Check size={14} />
                    {s} · proposed
                  </span>
                ))}
              </div>
              <p className="muted">
                Suggested boundary: application resource group only; no billing administration or
                organization-wide permissions.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid-two">
                {field('Private network / VPC', 'network')}
                {field('Private subnet reference', 'subnet')}
                {field('TLS domain', 'domain')}
              </div>
              <p>
                Plan private ingress, an outbound allowlist and private database connectivity.
                Connectivity validation is a rehearsal until an adapter is connected.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <div className="grid-two">
                {field('Runtime', 'runtime', [
                  'Docker Compose',
                  'Kubernetes / Helm',
                  'EC2 runner',
                  'Azure Container Apps',
                  'GCP Cloud Run',
                ])}
                {field('vCPU limit', 'cpu')}
                {field('Memory limit (GB)', 'memory')}
                {field('Sandbox lifetime', 'expiry', [
                  '30 minutes',
                  '2 hours',
                  '8 hours',
                  'Until reviewed',
                ])}
                {field('Budget ceiling (USD)', 'budget')}
              </div>
              <p className="muted">
                Zero is the default spending ceiling. This plan does not reserve or purchase
                compute.
              </p>
            </>
          )}
          {step === 4 && (
            <>
              <div className="infra-summary">
                {Object.entries({
                  Provider: plan.provider,
                  Placement: plan.placement,
                  Region: plan.region,
                  Runtime: plan.runtime,
                  Identity: plan.identity || 'Not set',
                  Network: plan.network || 'Not set',
                  'Resource ceiling': `${plan.cpu} vCPU / ${plan.memory} GB`,
                }).map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={plan.approval}
                  onChange={(e) => patch('approval', e.target.checked)}
                />
                I understand this is a configuration plan, not a deployed environment.
              </label>
              <button
                className="button primary"
                onClick={() => {
                  const errs = validateInfrastructure(plan);
                  setIssues(errs);
                  setChecked(!errs.length);
                  if (!errs.length) save('Readiness plan validated');
                }}
              >
                Validate configuration
              </button>
              {checked && (
                <p role="status">
                  Configuration complete. External permission, network and billing checks remain
                  required.
                </p>
              )}
            </>
          )}
          {step === 5 && (
            <>
              <p>
                Export a plan for your platform team. The repository includes a Docker packaging
                example for this web prototype; production hardening remains a separate deployment
                task.
              </p>
              <div className="infra-command">
                <code>
                  docker compose config
                  <br />
                  docker compose build
                  <br />
                  docker compose up -d
                </code>
              </div>
              <button
                className="button"
                onClick={() =>
                  download(
                    'architect-installation-plan.json',
                    JSON.stringify(deploymentBundle(plan), null, 2),
                    'application/json',
                  )
                }
              >
                <Download size={16} />
                Download installation plan
              </button>
              <button
                className="button"
                onClick={() => {
                  save('Installation rehearsal recorded');
                  notify('Rehearsal recorded. Nothing was installed on a server.');
                }}
              >
                Rehearse installation check
              </button>
              <p className="muted">
                Use the company-managed secret store. The hosted demo does not become private just
                by selecting this option.
              </p>
            </>
          )}
          {step === 6 && (
            <>
              <div className="grid-two">
                {field('Backup cadence', 'backup', ['Daily', 'Every 6 hours', 'Weekly'])}
                {field('Pinned release', 'version')}
              </div>
              <p>
                Assign an owner, test restore into an isolated environment and review changes before
                an upgrade.
              </p>
              <button
                className="button"
                onClick={() => {
                  save('Restore drill proposed');
                  onNavigate('recovery');
                }}
              >
                Plan recovery drill <ArrowRight size={15} />
              </button>
            </>
          )}
          {!!issues.length && (
            <ul className="form-error" role="alert">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          <div className="modal-footer">
            <button className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </button>
            <button className="button" onClick={() => save(stages[step] + ' draft')}>
              Save draft
            </button>
            {step < 6 && (
              <button className="button primary" onClick={() => setStep(step + 1)}>
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          {area === 'infrastructure' && (
            <div className="grid-two">
              {infrastructureFlows.map((f) => (
                <section className="panel" key={f.id}>
                  <span className="eyebrow">
                    {f.id} · {f.persona}
                  </span>
                  <h2>{f.title}</h2>
                  <ol className="infra-flow-list">
                    {f.journey.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <button
                    className="button primary"
                    onClick={() => {
                      setTab('Guided setup');
                      setStep(f.id === 'RELEASE-N5' ? 0 : 5);
                    }}
                  >
                    Explore this flow <ArrowRight size={16} />
                  </button>
                </section>
              ))}
            </div>
          )}
          {area === 'connections' && (
            <section className="panel">
              <span className="eyebrow">CONNECTION REGISTRY</span>
              <h2>The smallest useful permission.</h2>
              <div className="grid-two">
                {field('Provider', 'provider', ['AWS', 'Azure', 'GCP', 'On-premises'])}
                {field('Identity reference', 'identity')}
                {field('Private network', 'network')}
                {field('Region', 'region')}
              </div>
              <button className="button primary" onClick={() => save('Cloud connection draft')}>
                Save connection draft
              </button>
              <button
                className="button"
                onClick={() => {
                  setStep(1);
                  setTab('Guided setup');
                }}
              >
                Review permission boundary
              </button>
            </section>
          )}
          {area === 'runners' && (
            <>
              <div className="infra-stats">
                {[
                  ['Runner pools', '0 connected'],
                  ['Active sandboxes', 'No telemetry'],
                  ['Spending ceiling', `$${plan.budget}`],
                ].map(([k, v]) => (
                  <section className="panel" key={k}>
                    <small>{k}</small>
                    <h2>{v}</h2>
                  </section>
                ))}
              </div>
              <section className="panel">
                <h2>Define a safe execution envelope.</h2>
                <div className="grid-two">
                  {field('Runtime', 'runtime', [
                    'Docker Compose',
                    'Kubernetes / Helm',
                    'EC2 runner',
                    'Azure Container Apps',
                    'GCP Cloud Run',
                  ])}
                  {field('Sandbox lifetime', 'expiry', [
                    '30 minutes',
                    '2 hours',
                    '8 hours',
                    'Until reviewed',
                  ])}
                  {field('vCPU limit', 'cpu')}
                  {field('Memory limit (GB)', 'memory')}
                </div>
                <button className="button primary" onClick={() => save('Runner pool draft')}>
                  Save runner profile
                </button>
                <button className="button" onClick={() => onNavigate('qa')}>
                  Continue to test planning
                </button>
              </section>
            </>
          )}
          {area === 'installation' && (
            <section className="panel install-hero">
              <Box size={40} />
              <h2>One package. Your environment.</h2>
              <p>
                Review the prerequisites, export configuration and hand off to the operator who owns
                the infrastructure.
              </p>
              <div className="grid-two">
                {field('Installation target', 'runtime', ['Docker Compose', 'Kubernetes / Helm'])}
                {field('Pinned version', 'version')}
                {field('Domain', 'domain')}
              </div>
              <button
                className="button primary"
                onClick={() => {
                  setStep(5);
                  setTab('Guided setup');
                }}
              >
                Open installation guide <ArrowRight size={16} />
              </button>
              <a
                className="button"
                href="https://github.com/darshdevlab/Lyzr-Architect-Assignment/tree/main/apps/platform"
                target="_blank"
                rel="noreferrer"
              >
                Repository & Docker package
              </a>
            </section>
          )}
          {area === 'governance' && (
            <section className="panel">
              <ShieldCheck size={32} />
              <h2>Review policy before enforcing it.</h2>
              <p>
                Organization membership and contributor/viewer access are enforced by the shared
                backend. Network restrictions, SSO, data residency and retention below are policy
                drafts.
              </p>
              <div className="grid-two">
                {field('Placement', 'placement', [
                  'Architect managed',
                  'Bring your cloud',
                  'Hybrid private runners',
                  'On-premises',
                ])}
                {field('Approved region', 'region')}
                {field('Budget ceiling', 'budget')}
                {field('Identity reference', 'identity')}
              </div>
              <button className="button primary" onClick={() => save('Governance policy draft')}>
                Save policy draft
              </button>
              <button className="button" onClick={() => onNavigate('company-access')}>
                Manage organization access
              </button>
            </section>
          )}
          {area === 'recovery' && (
            <section className="panel">
              <RotateCcw size={32} />
              <h2>Prove the way back.</h2>
              <div className="grid-two">
                {field('Backup cadence', 'backup', ['Daily', 'Every 6 hours', 'Weekly'])}
                {field('Restore release', 'version')}
              </div>
              <div className="infra-checklist">
                {[
                  'Verify backup integrity',
                  'Restore to an isolated network',
                  'Check company access and project counts',
                  'Run application smoke tests',
                  'Approve cutover / retain rollback',
                ].map((s, i) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      checked={plan.steps.includes(s)}
                      onChange={(e) =>
                        patch(
                          'steps',
                          e.target.checked ? [...plan.steps, s] : plan.steps.filter((x) => x !== s),
                        )
                      }
                    />
                    <span>0{i + 1}</span>
                    {s}
                  </label>
                ))}
              </div>
              <button className="button primary" onClick={() => save('Recovery checklist draft')}>
                Save recovery checklist
              </button>
              <button
                className="button"
                onClick={() =>
                  download(
                    'restore-drill.json',
                    JSON.stringify(
                      { prototype: true, steps: plan.steps, version: plan.version },
                      null,
                      2,
                    ),
                    'application/json',
                  )
                }
              >
                Export drill
              </button>
            </section>
          )}
          <div className="infra-handoffs">
            {[
              ['connections', 'Cloud connections', Cloud],
              ['runners', 'Private runners', Server],
              ['installation', 'Installation', Box],
              ['governance', 'Governance', ShieldCheck],
              ['recovery', 'Recovery', Database],
            ].map(([id, label, Icon]) => {
              const I = Icon as typeof Cloud;
              return (
                <button
                  key={String(id)}
                  className={'panel ' + (area === id ? 'selected' : '')}
                  onClick={() => onNavigate(String(id))}
                >
                  <I size={21} />
                  <strong>{String(label)}</strong>
                  <ArrowRight size={15} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
