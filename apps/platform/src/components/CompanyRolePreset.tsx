import { useEffect, useState } from 'react';
import { roleHome, roleRoutes, type CompanyData } from '../lib/company-features';
export function CompanyRolePreset({
  data,
  canManage,
  onPublish,
}: {
  data: CompanyData;
  canManage: boolean;
  onPublish: (patch: Partial<CompanyData>) => void;
}) {
  const [role, setRole] = useState('Product manager'),
    [views, setViews] = useState<string[]>([]),
    [widgets, setWidgets] = useState('Assigned work, Review queue'),
    [filters, setFilters] = useState('Owned by current member'),
    [templates, setTemplates] = useState(''),
    [workflows, setWorkflows] = useState(''),
    [preview, setPreview] = useState(false);
  useEffect(() => {
    const p = data.rolePresets?.[role];
    setViews(data.departmentViews[role] || roleHome(role).areas);
    setWidgets(p?.widgets || 'Assigned work, Review queue');
    setFilters(p?.filters || 'Owned by current member');
    setTemplates(p?.templates || '');
    setWorkflows(p?.workflows || '');
    setPreview(false);
  }, [role, data.departmentViews, data.rolePresets]);
  const current = data.rolePresets?.[role];
  return (
    <section className="panel">
      <h2>Publish a deliberate team starting point.</h2>
      <p>
        Only workspace administrators publish shared defaults. Preview changes before applying them;
        preferences never grant access.
      </p>
      <label className="field">
        Team role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {Object.keys(roleRoutes).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <div className="company-check-grid">
        {[
          'company',
          'delivery',
          'revenue',
          'success',
          'finance',
          'people',
          'metrics',
          'growth',
          'botteams',
          'mcp',
          'code',
          'qa',
          'studio',
        ].map((v) => (
          <label key={v}>
            <input
              type="checkbox"
              disabled={!canManage}
              checked={views.includes(v)}
              onChange={(e) =>
                setViews(e.target.checked ? [...views, v] : views.filter((x) => x !== v))
              }
            />
            {v}
          </label>
        ))}
      </div>
      <div className="grid-two">
        {[
          ['Home widgets', widgets, setWidgets],
          ['Default filters', filters, setFilters],
          ['Template references', templates, setTemplates],
          ['Workflow presets', workflows, setWorkflows],
        ].map(([label, value, set]) => (
          <label key={String(label)} className="field">
            {String(label)}
            <input
              disabled={!canManage}
              value={String(value)}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="row">
        <button className="button" disabled={!canManage} onClick={() => setPreview(true)}>
          Preview member view
        </button>
        {current && (
          <button
            className="button"
            disabled={!canManage}
            onClick={() => {
              setViews(roleHome(role).areas);
              setWidgets('Assigned work, Review queue');
              setFilters('Owned by current member');
              setTemplates('');
              setWorkflows('');
              setPreview(true);
            }}
          >
            Preview reset to role default
          </button>
        )}
      </div>
      {preview && (
        <div className="notice">
          <h3>
            {role} · proposed version {(current?.version || 0) + 1}
          </h3>
          <p>Home actions: {views.join(' → ')}</p>
          <p>
            Widgets: {widgets}; filters: {filters}
          </p>
          <p>
            Templates: {templates || 'No override'}; workflows: {workflows || 'No override'}
          </p>
          <button
            className="button primary"
            disabled={!canManage}
            onClick={() => {
              const preset = {
                role,
                widgets,
                filters,
                templates,
                workflows,
                version: (current?.version || 0) + 1,
                previous: current ? { ...current, previous: undefined } : undefined,
              };
              onPublish({
                departmentViews: { ...data.departmentViews, [role]: views },
                rolePresets: { ...data.rolePresets, [role]: preset },
              });
              setPreview(false);
            }}
          >
            Publish reviewed defaults
          </button>
        </div>
      )}
      <p className="muted">
        Published version: {current?.version || 'none'}. Template and workflow references are
        guidance; they do not automatically execute work.
      </p>
    </section>
  );
}
