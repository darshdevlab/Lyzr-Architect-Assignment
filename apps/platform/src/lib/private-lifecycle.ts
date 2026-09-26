export type PrivateAction = 'Install' | 'Upgrade' | 'Restore' | 'Retire' | 'Sandbox';
export type LifecycleRun = {
  id: string;
  action: PrivateAction;
  profile: string;
  version: string;
  status: 'Review' | 'Running' | 'Failed' | 'Completed' | 'Cancelled';
  steps: { label: string; status: 'Pending' | 'Passed' | 'Failed' }[];
  notes: string;
  at: string;
  simulation: true;
};
export const lifecycleSteps: Record<PrivateAction, string[]> = {
  Install: [
    'Validate dependency and identity references',
    'Review private database and secret-store boundary',
    'Bootstrap company administrator through identity provider',
    'Apply reviewed migration plan',
    'Check network, TLS and worker reachability',
    'Verify sign-in, project storage and test workload',
  ],
  Upgrade: [
    'Compare release compatibility and maintenance window',
    'Verify backup and restoration target',
    'Drain active workers',
    'Apply reviewed migration and version plan',
    'Run smoke checks',
    'Approve traffic promotion and retain rollback',
  ],
  Restore: [
    'Select backup and verify checksum',
    'Confirm isolated network and recovery objectives',
    'Restore into isolated target',
    'Compare project counts and membership',
    'Run application and identity checks',
    'Approve cutover with rollback retained',
  ],
  Retire: [
    'Inspect projects, services and scheduled work',
    'Drain workers and pause schedules',
    'Export data and confirm retention',
    'Revoke scoped connection identities',
    'Clean up approved resources',
    'Verify no remaining scheduled or billable resources',
  ],
  Sandbox: [
    'Validate selected environment profile',
    'Review quota and spending ceiling',
    'Queue isolated test workspace',
    'Check private-service reachability',
    'Run selected acceptance checks',
    'Expire workspace and verify cleanup',
  ],
};
export function makeLifecycleRun(
  action: PrivateAction,
  profile: string,
  version: string,
  id: string,
): LifecycleRun {
  return {
    id,
    action,
    profile,
    version,
    status: 'Review',
    steps: lifecycleSteps[action].map((label) => ({ label, status: 'Pending' })),
    notes: '',
    at: new Date().toISOString(),
    simulation: true,
  };
}
export function advanceLifecycle(run: LifecycleRun, fail = false): LifecycleRun {
  if (['Completed', 'Cancelled'].includes(run.status)) return run;
  const index = run.steps.findIndex((s) => s.status !== 'Passed');
  if (index < 0) return { ...run, status: 'Completed' };
  const steps = run.steps.map((s, i) =>
    i === index ? { ...s, status: fail ? ('Failed' as const) : ('Passed' as const) } : s,
  );
  return {
    ...run,
    steps,
    status: fail ? 'Failed' : steps.every((s) => s.status === 'Passed') ? 'Completed' : 'Running',
  };
}
export function compatibilityIssues(provider: string, runtime: string) {
  return runtime === 'EC2 runner' && provider !== 'AWS'
    ? ['EC2 requires an AWS connection.']
    : runtime === 'Azure Container Apps' && provider !== 'Azure'
      ? ['Azure Container Apps requires an Azure connection.']
      : runtime === 'GCP Cloud Run' && provider !== 'GCP'
        ? ['Cloud Run requires a GCP connection.']
        : [];
}
export type PrivateProfile = {
  id: string;
  name: string;
  projectId: string;
  stage: string;
  service: string;
  controlPlane: string;
  execution: string;
  appHosting: string;
  provider: string;
  runtime: string;
  region: string;
  identity: string;
  network: string;
  ttl: string;
  budget: string;
};
