export type NavigationContext = {
  recordId?: string;
  sourceId?: string;
  returnView?: string;
  tab?: string;
  featureId?: string;
  document?: 'prd' | 'trd';
  source?: string;
  panel?: string;
};
const keys = [
  'recordId',
  'sourceId',
  'returnView',
  'tab',
  'featureId',
  'document',
  'source',
  'panel',
] as const;
export function contextFromUrl(url: string): NavigationContext {
  const p = new URL(url).searchParams;
  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = p.get(key === 'recordId' ? 'record' : key);
    if (value) result[key] = value;
  }
  return result as NavigationContext;
}
export function writeContext(url: URL, context: NavigationContext) {
  for (const key of keys) {
    url.searchParams.delete(key === 'recordId' ? 'record' : key);
    if (context[key]) url.searchParams.set(key === 'recordId' ? 'record' : key, context[key]!);
  }
  return url;
}
export function roleDestination(role: string, edition: number) {
  if (edition >= 3) return edition === 4 ? 'infrastructure' : 'company';
  return /developer/i.test(role)
    ? 'code'
    : /qa/i.test(role)
      ? 'qa'
      : /designer/i.test(role)
        ? 'buildflows'
        : 'today';
}
