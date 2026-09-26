import {
  compatibilityIssues,
  type PrivateProfile,
  type LifecycleRun,
} from './private-lifecycle.ts';
export type InfrastructurePlan = {
  controlPlane?: string;
  execution?: string;
  appHosting?: string;
  profiles?: PrivateProfile[];
  runs?: LifecycleRun[];
  name: string;
  provider: string;
  placement: string;
  region: string;
  identity: string;
  network: string;
  subnet: string;
  runtime: string;
  cpu: string;
  memory: string;
  expiry: string;
  budget: string;
  domain: string;
  backup: string;
  version: string;
  approval: boolean;
  steps: string[];
  events: { at: string; action: string }[];
};
export const infraDefaults: InfrastructurePlan = {
  name: 'Company private workspace',
  provider: 'AWS',
  placement: 'Bring your cloud',
  region: 'ap-south-1',
  identity: '',
  network: '',
  subnet: '',
  runtime: 'Docker Compose',
  cpu: '2',
  memory: '4',
  expiry: '2 hours',
  budget: '0',
  domain: '',
  backup: 'Daily',
  version: '4.0.0',
  approval: false,
  steps: [],
  events: [],
};
export function validateInfrastructure(p: InfrastructurePlan) {
  const errors: string[] = [...compatibilityIssues(p.provider, p.runtime)];
  if (!p.name.trim()) errors.push('Name your environment.');
  if (p.placement !== 'Architect managed' && !p.identity.trim())
    errors.push('Add a scoped identity reference, not a secret.');
  if (p.placement !== 'Architect managed' && !p.network.trim())
    errors.push('Add a private network or VPC reference.');
  if (!Number.isFinite(Number(p.cpu)) || Number(p.cpu) < 1 || Number(p.cpu) > 64)
    errors.push('CPU must be between 1 and 64.');
  if (!Number.isFinite(Number(p.memory)) || Number(p.memory) < 1 || Number(p.memory) > 512)
    errors.push('Memory must be between 1 and 512 GB.');
  if (!Number.isFinite(Number(p.budget)) || Number(p.budget) < 0)
    errors.push('Budget must be zero or greater.');
  if (!p.approval)
    errors.push('Acknowledge that this is a plan and no cloud resources will be created.');
  return errors;
}
export function deploymentBundle(p: InfrastructurePlan) {
  return {
    kind: 'ArchitectInstallationPlan',
    version: '4.0',
    prototype: true,
    environment: p,
    checks: [
      'TLS termination',
      'Secrets manager injection',
      'Database migrations and RLS',
      'Company identity and recovery',
      'Network egress restrictions',
      'Backup restore drill',
    ],
    limitations: [
      'No cloud resources provisioned',
      'External SSO requires a supported provider and plan',
      'Hosted prototype shares Supabase; private data migration requires a reviewed migration',
    ],
    commands: ['docker compose config', 'docker compose build', 'docker compose up -d'],
    estimatedCost: 'Not calculated: validate against your cloud pricing before provisioning.',
  };
}
export const infrastructureFlows = [
  {
    id: 'RELEASE-N5',
    title: 'Cloud connections & private execution',
    persona: 'DevOps / platform admin',
    journey: [
      'Choose managed, hybrid or private placement',
      'Select AWS, Azure, GCP or on-premises',
      'Reference a least-privilege identity',
      'Define network and runner limits',
      'Review readiness checks',
      'Export plan for approval',
    ],
  },
  {
    id: 'RELEASE-N6',
    title: 'Private installation & lifecycle',
    persona: 'Company owner / platform admin',
    journey: [
      'Choose Docker or Kubernetes',
      'Review dependencies and region',
      'Configure domain and secret references',
      'Export installation bundle',
      'Rehearse health validation',
      'Plan upgrade, backup and recovery',
    ],
  },
];

export function normalizeInfrastructure(raw: unknown): InfrastructurePlan {
  const p = { ...infraDefaults, steps: [], events: [] } as InfrastructurePlan;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return p;
  const r = raw as Record<string, unknown>;
  for (const key of Object.keys(infraDefaults) as (keyof InfrastructurePlan)[]) {
    if (typeof infraDefaults[key] === 'string' && typeof r[key] === 'string')
      (p as unknown as Record<string, unknown>)[key] = r[key];
  }
  for (const k of ['controlPlane', 'execution', 'appHosting'] as const)
    if (typeof r[k] === 'string') p[k] = r[k];
  p.profiles = Array.isArray(r.profiles)
    ? r.profiles
        .filter(
          (x): x is PrivateProfile => !!x && typeof x.id === 'string' && typeof x.name === 'string',
        )
        .slice(0, 50)
    : [];
  p.runs = Array.isArray(r.runs)
    ? r.runs
        .filter(
          (x): x is LifecycleRun =>
            !!x && typeof x.id === 'string' && Array.isArray(x.steps) && x.simulation === true,
        )
        .slice(0, 50)
    : [];
  p.approval = r.approval === true;
  p.steps = Array.isArray(r.steps)
    ? r.steps.filter((x): x is string => typeof x === 'string').slice(0, 30)
    : [];
  p.events = Array.isArray(r.events)
    ? r.events
        .filter(
          (x): x is InfrastructurePlan['events'][number] =>
            !!x && typeof x.at === 'string' && typeof x.action === 'string',
        )
        .slice(0, 30)
    : [];
  return p;
}
