export const accountTabs = [
  'Preferences',
  'Notifications',
  'Billing preview',
  'Security',
  'Support',
] as const;
export function accountTab(value: unknown) {
  return accountTabs.find((tab) => tab === value) || 'Preferences';
}
export type Notice = { id: string; title: string; read: boolean; archived: boolean };
export type Ledger = {
  id: string;
  type: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  at: string;
};
export type SupportDraft = { id: string; reference: string; body: string; updatedAt: string };
export type Preferences = {
  language: string;
  timezone: string;
  quiet: boolean;
  inbox: Notice[];
  ledger: Ledger[];
  plan: string;
  billingEmail: string;
  autoRecharge: boolean;
  cap: number;
  support: SupportDraft[];
};
export const planOptions = [
  'Free prototype',
  'Builder monthly · demonstration',
  'Company monthly · demonstration',
];
const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const validDate = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return !!value.trim();
  } catch {
    return false;
  }
}
export function defaultPreferences(): Preferences {
  return {
    language: 'English',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    quiet: false,
    inbox: [
      {
        id: 'welcome',
        title: 'Review your workspace settings and connected identity',
        read: false,
        archived: false,
      },
    ],
    ledger: [],
    plan: planOptions[0],
    billingEmail: '',
    autoRecharge: false,
    cap: 0,
    support: [],
  };
}
function unique<T extends { id: string }>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.id || seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}
/** Browser storage is untrusted and may contain an old schema or a partially written value. */
export function normalizePreferences(value: unknown): Preferences {
  const d = defaultPreferences(),
    v = object(value);
  return {
    language: v.language === 'Hindi' ? 'Hindi' : 'English',
    timezone: typeof v.timezone === 'string' && validTimezone(v.timezone) ? v.timezone : d.timezone,
    quiet: v.quiet === true,
    inbox: Array.isArray(v.inbox)
      ? unique(
          v.inbox
            .slice(0, 200)
            .map(object)
            .filter(
              (n) => typeof n.id === 'string' && typeof n.title === 'string' && n.title.trim(),
            )
            .map((n) => ({
              id: text(n.id, 100),
              title: text(n.title, 500),
              read: n.read === true,
              archived: n.archived === true,
            })),
        )
      : d.inbox,
    ledger: Array.isArray(v.ledger)
      ? unique(
          v.ledger
            .slice(0, 500)
            .map(object)
            .filter(
              (r) =>
                typeof r.id === 'string' &&
                typeof r.type === 'string' &&
                typeof r.amount === 'number' &&
                Number.isFinite(r.amount) &&
                r.amount >= 0 &&
                r.amount <= 1000000 &&
                validDate(r.at) &&
                ['Completed', 'Pending', 'Failed'].includes(String(r.status)),
            )
            .map((r) => ({
              id: text(r.id, 100),
              type: text(r.type, 150),
              amount: r.amount as number,
              status: r.status as Ledger['status'],
              at: r.at as string,
            })),
        )
      : [],
    plan: planOptions.includes(String(v.plan)) ? String(v.plan) : d.plan,
    billingEmail: text(v.billingEmail, 254),
    autoRecharge: v.autoRecharge === true,
    cap:
      typeof v.cap === 'number' && Number.isFinite(v.cap)
        ? Math.min(1000000, Math.max(0, v.cap))
        : 0,
    support: Array.isArray(v.support)
      ? unique(
          v.support
            .slice(0, 50)
            .map(object)
            .filter(
              (r) =>
                typeof r.id === 'string' &&
                /^LOCAL-[A-Z0-9-]{6,64}$/.test(String(r.reference)) &&
                typeof r.body === 'string' &&
                r.body.trim() &&
                validDate(r.updatedAt),
            )
            .map((r) => ({
              id: text(r.id, 100),
              reference: r.reference as string,
              body: text(r.body, 4000),
              updatedAt: r.updatedAt as string,
            })),
        )
      : [],
  };
}
export function accountPreferencesKey(account: string) {
  return 'architect.account-preferences.' + account;
}
export function loadPreferences(storage: Pick<Storage, 'getItem'>, account: string) {
  try {
    return normalizePreferences(
      JSON.parse(storage.getItem(accountPreferencesKey(account)) || 'null'),
    );
  } catch {
    return defaultPreferences();
  }
}
export function persistPreferences(
  storage: Pick<Storage, 'setItem'>,
  account: string,
  prefs: Preferences,
) {
  const clean = normalizePreferences(prefs);
  storage.setItem(accountPreferencesKey(account), JSON.stringify(clean));
  return clean;
}
export function upsertSupportDraft(
  prefs: Preferences,
  body: string,
  existingId?: string,
  now = new Date().toISOString(),
  id = crypto.randomUUID(),
): { preferences: Preferences; draft: SupportDraft } {
  const clean = body.trim();
  if (!clean || clean.length > 4000)
    throw new Error('Describe the issue using 1 to 4,000 characters.');
  if (!validDate(now)) throw new Error('Unable to date this draft.');
  const existing = prefs.support.find((d) => d.id === existingId);
  if (!existing && prefs.support.length >= 50)
    throw new Error('You have 50 saved drafts. Export and remove an older one first.');
  const draft: SupportDraft = {
    id: existing?.id || id,
    reference: existing?.reference || 'LOCAL-' + id.toUpperCase(),
    body: clean,
    updatedAt: now,
  };
  return {
    preferences: { ...prefs, support: [draft, ...prefs.support.filter((d) => d.id !== draft.id)] },
    draft,
  };
}
export function visibleNotifications(prefs: Preferences, filter: string) {
  return prefs.inbox.filter((n) =>
    filter === 'Archived' ? n.archived : !n.archived && (filter !== 'Unread' || !n.read),
  );
}
