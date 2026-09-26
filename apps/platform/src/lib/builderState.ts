import type { Project } from './model';
export type BuilderNavigation = {
  tab?: string;
  featureId?: string;
  document?: 'prd' | 'trd';
  source?: string;
  panel?: string;
};
export function readDraft(project: string, key: string, fallback: string) {
  try {
    return sessionStorage.getItem(`architect.draft.${project}.${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeDraft(project: string, key: string, value: string) {
  try {
    sessionStorage.setItem(`architect.draft.${project}.${key}`, value);
  } catch {
    /* The editor remains usable when session storage is unavailable. */
  }
}
export function clearDraft(project: string, key: string) {
  try {
    sessionStorage.removeItem(`architect.draft.${project}.${key}`);
  } catch {}
}
export function checkpoint(history: NonNullable<Project['history']>, html: string, label: string) {
  return [...history, { id: crypto.randomUUID(), html, at: new Date().toISOString(), label }]
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-20);
}
export function builderContext(project: Project, max = 39000) {
  const base = {
    title: project.title,
    brief: project.brief,
    prd: project.prd,
    trd: project.trd,
    html: project.html,
    attachments: project.attachments,
    workflow: project.workflow,
  };
  const full = JSON.stringify(base);
  if (full.length <= max) return { text: full, truncated: false, originalLength: full.length };
  // Bound each field independently so the context always remains valid JSON.
  const text = JSON.stringify({
    title: project.title.slice(0, 200),
    brief: project.brief.slice(0, 2000),
    prd: project.prd.slice(0, 4500),
    trd: project.trd.slice(0, 3500),
    html: project.html?.slice(0, 10000),
    attachments: project.attachments
      .slice(0, 8)
      .map((a) => ({ name: a.name.slice(0, 100), text: a.text.slice(0, 1000) })),
    workflowSummary: JSON.stringify(project.workflow || {}).slice(0, 3500),
    contextTruncated: true,
  });
  // JSON escaping can expand source significantly: fall back to a bounded serialized excerpt.
  return {
    text:
      text.length <= max
        ? text
        : JSON.stringify({
            title: project.title.slice(0, 200),
            contextExcerpt: full.slice(0, Math.floor(max / 6) - 200),
            contextTruncated: true,
          }),
    truncated: true,
    originalLength: full.length,
  };
}
export function workflowPrompt(id: string, values: Record<string, string>) {
  if (id === 'BUILD-E1') return values.prompt;
  if (id === 'BUILD-E2') return `Change ${values.target}: ${values.instruction}. ${values.apply}.`;
  if (id === 'OPS-E4') return `Investigate: ${values.finding}. Impact: ${values.impact}`;
  return `Use this project decision (${id}) in the next change:\n${Object.entries(values)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}`;
}
