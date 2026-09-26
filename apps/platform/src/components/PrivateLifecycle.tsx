import { useState } from 'react';
import type { InfrastructurePlan } from '../lib/infrastructure';
import {
  makeLifecycleRun,
  advanceLifecycle,
  compatibilityIssues,
  type PrivateAction,
  type PrivateProfile,
  type LifecycleRun,
} from '../lib/private-lifecycle';
import { uid, type Project } from '../lib/model';
export default function PrivateLifecycle({
  plan,
  onChange,
  projects,
  readOnly,
}: {
  plan: InfrastructurePlan;
  onChange: (p: InfrastructurePlan) => void;
  projects: Project[];
  readOnly: boolean;
}) {
  const [section, setSection] = useState('Environment profiles'),
    [profileId, setProfileId] = useState(''),
    [stage, setStage] = useState('Preview'),
    [service, setService] = useState('Whole application'),
    [projectId, setProjectId] = useState(projects[0]?.id || ''),
    [issue, setIssue] = useState(''),
    [selected, setSelected] = useState(''),
    [action, setAction] = useState<PrivateAction>('Install'),
    [note, setNote] = useState(''),
    [approval, setApproval] = useState(false);
  const profiles = plan.profiles || [],
    runs = plan.runs || [],
    run = runs.find((r) => r.id === selected);
  const current = profiles.find((p) => p.id === profileId);
  function saveProfile() {
    const errors = compatibilityIssues(plan.provider, plan.runtime);
    if (!plan.identity.trim() || !plan.network.trim())
      errors.push('Save scoped identity and private network references first.');
    if (!projectId) errors.push('Choose an existing project.');
    if (errors.length) {
      setIssue(errors.join(' '));
      return;
    }
    const profile: PrivateProfile = {
      id: profileId || uid(),
      name: plan.name,
      projectId,
      stage,
      service,
      controlPlane: plan.controlPlane || 'Company cloud',
      execution: plan.execution || 'Private workers',
      appHosting: plan.appHosting || 'Company cloud',
      provider: plan.provider,
      runtime: plan.runtime,
      region: plan.region,
      identity: plan.identity,
      network: plan.network,
      ttl: plan.expiry,
      budget: plan.budget,
    };
    onChange({ ...plan, profiles: [...profiles.filter((p) => p.id !== profile.id), profile] });
    setProfileId(profile.id);
    setIssue('Environment profile saved. No resources were created.');
  }
  function updateRun(next: LifecycleRun) {
    onChange({ ...plan, runs: runs.map((r) => (r.id === next.id ? next : r)) });
  }
  return (
    <section className="panel private-lifecycle">
      <div className="section-heading">
        <div>
          <span className="eyebrow">PRIVATE OPERATIONS · INTERACTIVE REHEARSAL</span>
          <h2>Inspect the boundaries. Rehearse the journey.</h2>
        </div>
      </div>
      <p>
        Configuration and scenario results below are saved prototype records. They never call a
        cloud provider, install software or change access.
      </p>
      <div className="segmented">
        {['Environment profiles', 'Lifecycle rehearsal', 'Access preview'].map((t) => (
          <button key={t} aria-pressed={t === section} onClick={() => setSection(t)}>
            {t}
          </button>
        ))}
      </div>
      {section === 'Environment profiles' && (
        <>
          <div className="grid-two">
            {(['controlPlane', 'execution', 'appHosting'] as const).map((key, i) => (
              <label className="field" key={key}>
                {['Architect control plane', 'Execution workers', 'Generated-app hosting'][i]}
                <select
                  disabled={readOnly}
                  value={plan[key] || ['Company cloud', 'Private workers', 'Company cloud'][i]}
                  onChange={(e) => onChange({ ...plan, [key]: e.target.value })}
                >
                  {(i === 1
                    ? ['Private workers', 'Managed workers', 'Hybrid workers']
                    : ['Company cloud', 'Architect managed', 'On-premises']
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className="field">
              Project
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Choose project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Stage
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                {['Preview', 'Staging', 'Production'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Service
              <input value={service} onChange={(e) => setService(e.target.value)} />
            </label>
          </div>
          <button className="button primary" disabled={readOnly} onClick={saveProfile}>
            {profileId ? 'Update profile' : 'Save environment profile'}
          </button>
          <button
            className="button"
            onClick={() => {
              setProfileId('');
              setIssue('New profile uses the current placement draft.');
            }}
          >
            New profile
          </button>
          <div className="infra-profile-list">
            {profiles.map((p) => (
              <button
                className="panel"
                key={p.id}
                onClick={() => {
                  setProfileId(p.id);
                  setStage(p.stage);
                  setService(p.service);
                  setProjectId(p.projectId);
                  if (!readOnly)
                    onChange({
                      ...plan,
                      name: p.name,
                      provider: p.provider,
                      runtime: p.runtime,
                      region: p.region,
                      identity: p.identity,
                      network: p.network,
                      controlPlane: p.controlPlane,
                      execution: p.execution,
                      appHosting: p.appHosting,
                    });
                }}
              >
                <strong>{p.name}</strong>
                <p>
                  {p.stage} · {p.service} · {p.provider}
                </p>
                <small>
                  Control: {p.controlPlane} · Workers: {p.execution} · App: {p.appHosting}
                </small>
              </button>
            ))}
          </div>
        </>
      )}
      {section === 'Lifecycle rehearsal' && (
        <>
          <div className="grid-two">
            <label className="field">
              Environment profile
              <select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
                <option value="">Choose saved profile</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Operation
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value as PrivateAction);
                  setApproval(false);
                }}
              >
                {['Install', 'Upgrade', 'Restore', 'Retire', 'Sandbox'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Maintenance window / recovery objective / operator notes
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Owner, planned window, RPO/RTO, retained backup and rollback target"
            />
          </label>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={approval}
              onChange={(e) => setApproval(e.target.checked)}
            />
            I reviewed this simulation's target and impact.
          </label>
          <button
            className="button primary"
            disabled={readOnly || !current || !approval || !note.trim()}
            onClick={() => {
              const next = {
                ...makeLifecycleRun(action, current!.name, plan.version, uid()),
                notes: note,
              };
              onChange({ ...plan, runs: [next, ...runs].slice(0, 50) });
              setSelected(next.id);
            }}
          >
            Prepare rehearsal
          </button>
          {run && (
            <section className="panel">
              <h3>
                {run.action} · {run.profile}
              </h3>
              <span className="status">Simulation · {run.status}</span>
              <p>{run.notes}</p>
              <ol>
                {run.steps.map((s, i) => (
                  <li key={i}>
                    {s.label} — <strong>{s.status}</strong>
                  </li>
                ))}
              </ol>
              <div className="row">
                <button
                  className="button primary"
                  disabled={readOnly || ['Completed', 'Cancelled'].includes(run.status)}
                  onClick={() => updateRun(advanceLifecycle(run))}
                >
                  {run.status === 'Failed' ? 'Retry failed check' : 'Simulate next check'}
                </button>
                <button
                  className="button"
                  disabled={readOnly || ['Completed', 'Cancelled', 'Failed'].includes(run.status)}
                  onClick={() => updateRun(advanceLifecycle(run, true))}
                >
                  Simulate failure
                </button>
                <button
                  className="button"
                  disabled={readOnly || ['Completed', 'Cancelled'].includes(run.status)}
                  onClick={() => updateRun({ ...run, status: 'Cancelled' })}
                >
                  Cancel rehearsal
                </button>
              </div>
              {run.status === 'Failed' && (
                <p role="alert">
                  The simulated check failed. Preserve the completed steps, correct the plan and
                  retry, or cancel. No cloud resources need cleanup.
                </p>
              )}
              {run.status === 'Completed' && (
                <p role="status">
                  Rehearsal complete. These are simulated checks, not evidence that infrastructure
                  is installed or healthy.
                </p>
              )}
            </section>
          )}
          <h3>Operation history</h3>
          {runs.map((r) => (
            <button className="button" key={r.id} onClick={() => setSelected(r.id)}>
              {r.action} · {r.profile} · {r.status}
            </button>
          ))}
        </>
      )}
      {section === 'Access preview' && (
        <>
          <p>
            Preview proposed access at company, project and environment level. Actual hosted
            enforcement remains the company membership rules; this table does not grant permissions.
          </p>
          <table>
            <thead>
              <tr>
                <th>Responsibility</th>
                <th>Allowed scope</th>
                <th>Approval boundary</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Company owner', 'Membership and policy', 'Retain an accountable owner'],
                [
                  'Platform administrator',
                  'Approved environment profiles',
                  'Production changes require reviewer',
                ],
                ['Developer', 'Own project preview', 'No production promotion'],
                ['QA', 'Assigned test sandbox', 'No policy or credential administration'],
                [
                  'Bot service identity',
                  'Explicit tools and project',
                  'Cannot exceed parent scope; expiry required',
                ],
                ['Viewer', 'Read permitted workspace', 'No mutation'],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((v) => (
                    <td key={v}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Revocation review: pause schedules → transfer owned work → revoke scoped identity →
            confirm remaining project access → retain an audit record.
          </p>
        </>
      )}
      {issue && (
        <p role="status" className="notice">
          {issue}
        </p>
      )}
    </section>
  );
}
