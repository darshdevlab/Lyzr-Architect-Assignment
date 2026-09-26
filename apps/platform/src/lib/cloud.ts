/** Browser client. Only publishable Supabase credentials belong in VITE_ variables. */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const key = env.VITE_SUPABASE_ANON_KEY || '';
export const configured = !!(url && key);
export interface CloudUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}
export interface SecuritySummary {
  email: string;
  emailVerified: boolean;
  providers: string[];
  lastSignInAt: string | null;
  expiresAt: number;
}
class CloudRequestError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'CloudRequestError';
    this.status = status;
    this.code = code;
  }
}
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user?: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; name?: string; avatar_url?: string; picture?: string };
  };
}
export interface ModelOption {
  id: string;
  name: string;
  family: string;
  contextLength: number;
  supportsImages: boolean;
  free: true;
}
export interface GenerationResult {
  text: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; cost: number };
  requestId: string;
  remaining: number;
}
const storageKey = 'architect.cloud.session.v1';
const listeners = new Set<(user: CloudUser | null) => void>();
function read(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
}
function asUser(user: Session['user']): CloudUser | null {
  return user?.id
    ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      }
    : null;
}
function store(value: Session | null, notify = true) {
  if (value) localStorage.setItem(storageKey, JSON.stringify(value));
  else localStorage.removeItem(storageKey);
  if (notify) listeners.forEach((fn) => fn(asUser(value?.user)));
}
function errorMessage(data: Record<string, unknown>, fallback: string) {
  return String(data.error_description || data.msg || data.message || data.error || fallback);
}
async function request(
  path: string,
  body?: unknown,
  token?: string,
  method = body ? 'POST' : 'GET',
) {
  if (!configured) throw new Error('Cloud sign-in is not configured. You can explore the demo.');
  const r = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('The cloud service returned an unexpected response.');
  }
  if (!r.ok)
    throw new CloudRequestError(
      errorMessage(data || {}, 'Cloud request failed. Please try again.'),
      r.status,
      String(data?.error_code || data?.code || data?.error || ''),
    );
  return data;
}
function accept(data: Session & { expires_in?: number }) {
  const s = {
    ...data,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
  };
  store(s);
  return s;
}
let refreshing: Promise<Session | null> | null = null;
async function session(): Promise<Session | null> {
  const s = read();
  if (!s) return null;
  if (s.expires_at > Date.now() / 1000 + 60) return s;
  if (refreshing) return refreshing;
  const refresh = async () => {
    const latest = read();
    if (!latest) return null;
    if (latest.expires_at > Date.now() / 1000 + 60) return latest;
    try {
      const renewed = await request('/auth/v1/token?grant_type=refresh_token', {
        refresh_token: latest.refresh_token,
      });
      if (read()?.refresh_token !== latest.refresh_token) return read();
      return accept(renewed);
    } catch (e) {
      if (read()?.refresh_token !== latest.refresh_token) return read();
      if (
        e instanceof CloudRequestError &&
        (e.status === 401 ||
          [
            'invalid_grant',
            'refresh_token_not_found',
            'refresh_token_already_used',
            'session_not_found',
          ].includes(e.code))
      ) {
        store(null);
        return null;
      }
      throw new Error(
        'Your session could not be refreshed. Your saved work is kept. Check your connection and retry.',
      );
    }
  };
  refreshing = (
    'locks' in navigator ? navigator.locks.request('architect-auth-refresh', refresh) : refresh()
  ).finally(() => {
    refreshing = null;
  });
  return refreshing;
}
const returnKey = 'architect.auth.return';
function cleanDestination(value: string) {
  try {
    const target = new URL(value, location.origin);
    if (target.origin !== location.origin) return '/';
    for (const key of [
      'code',
      'error',
      'error_code',
      'error_description',
      'access_token',
      'refresh_token',
    ])
      target.searchParams.delete(key);
    if (
      new URLSearchParams(target.hash.slice(1)).has('invite') ||
      /access_token|refresh_token/.test(target.hash)
    )
      target.hash = '';
    return target.pathname + target.search + target.hash;
  } catch {
    return '/';
  }
}
function currentDestination() {
  return cleanDestination(location.href);
}
function restoreDestination(fallback: string, recovery = false, useSaved = true) {
  const target = new URL(
    cleanDestination((useSaved ? sessionStorage.getItem(returnKey) : null) || fallback),
    location.origin,
  );
  if (recovery) target.searchParams.set('recovery', '1');
  history.replaceState({}, '', target.pathname + target.search + target.hash);
  sessionStorage.removeItem(returnKey);
}
function preserveInvitation() {
  const token = new URLSearchParams(location.hash.slice(1)).get('invite');
  if (token && /^[a-f0-9]{64}$/.test(token))
    sessionStorage.setItem('architect.pendingInvite', token);
}
let callbackPromise: Promise<void> | null = null;
async function finishCallback() {
  if (callbackPromise) return callbackPromise;
  callbackPromise = (async () => {
    const current = new URL(location.href);
    const code = current.searchParams.get('code');
    const hash = new URLSearchParams(location.hash.slice(1));
    const err = current.searchParams.get('error_description') || hash.get('error_description');
    if (err) {
      restoreDestination(currentDestination());
      throw new Error(err);
    }
    if (code) {
      const verifier = sessionStorage.getItem('architect.pkce');
      if (!verifier) {
        restoreDestination(currentDestination());
        throw new Error('Sign-in verification expired. Please try Google sign-in again.');
      }
      const data = await request('/auth/v1/token?grant_type=pkce', {
        auth_code: code,
        code_verifier: verifier,
      });
      restoreDestination(currentDestination(), current.searchParams.has('recovery'));
      sessionStorage.removeItem('architect.pkce');
      accept(data);
    }
    // Confirmation and recovery links may use an implicit callback. Verify before accepting.
    else if (hash.has('access_token')) {
      const access_token = hash.get('access_token')!;
      const refresh_token = hash.get('refresh_token') || '';
      const recovery = hash.get('type') === 'recovery' || current.searchParams.has('recovery');
      const user = await request('/auth/v1/user', undefined, access_token);
      restoreDestination(currentDestination(), recovery, false);
      accept({
        access_token,
        refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600),
        user,
      });
    }
  })().catch((e) => {
    callbackPromise = null;
    throw e;
  });
  return callbackPromise;
}
export function getAccessToken(): string | null {
  return read()?.access_token || null;
}
export const auth = {
  async getUser(): Promise<CloudUser | null> {
    if (!configured) return null;
    await finishCallback();
    const s = await session();
    if (!s) return null;
    try {
      const user = await request('/auth/v1/user', undefined, s.access_token);
      if (read()?.access_token !== s.access_token) return asUser(read()?.user);
      store({ ...s, user }, false);
      return asUser(user);
    } catch (e) {
      if (read()?.access_token !== s.access_token) return asUser(read()?.user);
      if (e instanceof CloudRequestError && e.status === 401) {
        store(null);
        return null;
      }
      throw e;
    }
  },
  async signIn(email: string, password: string) {
    const s = accept(await request('/auth/v1/token?grant_type=password', { email, password }));
    return asUser(s.user);
  },
  async signUp(email: string, password: string, name: string) {
    const data = await request(
      `/auth/v1/signup?redirect_to=${encodeURIComponent(location.origin + currentDestination())}`,
      { email, password, data: { full_name: name } },
    );
    if (data.access_token) return asUser(accept(data).user);
    return null;
  },
  async signInWithGoogle() {
    if (!configured) throw new Error('Google sign-in is not configured.');
    const bytes = crypto.getRandomValues(new Uint8Array(48));
    const verifier = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    const digest = new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
    );
    const challenge = btoa(String.fromCharCode(...digest))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    preserveInvitation();
    sessionStorage.setItem(returnKey, currentDestination());
    sessionStorage.setItem('architect.pkce', verifier);
    location.assign(
      `${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(location.origin + currentDestination())}&code_challenge=${challenge}&code_challenge_method=s256`,
    );
  },
  async signOut(expectedUserId?: string) {
    const s = await session();
    if (expectedUserId && s?.user?.id && s.user.id !== expectedUserId)
      throw new Error('The signed-in account changed.');
    try {
      if (s) await request('/auth/v1/logout?scope=global', {}, s.access_token);
    } finally {
      if (!s || read()?.user?.id === s.user?.id) store(null);
    }
  },
  async resetPassword(email: string) {
    const target = new URL(currentDestination(), location.origin);
    target.searchParams.set('recovery', '1');
    await request(`/auth/v1/recover?redirect_to=${encodeURIComponent(target.href)}`, { email });
  },
  async resendConfirmation(email: string): Promise<void> {
    await request(
      `/auth/v1/resend?redirect_to=${encodeURIComponent(location.origin + currentDestination())}`,
      { type: 'signup', email: email.trim() },
    );
  },
  async securitySummary(): Promise<SecuritySummary> {
    const s = await authorized();
    const user = await request('/auth/v1/user', undefined, s.access_token);
    if (read()?.user?.id !== s.user?.id) throw new Error('Your signed-in account changed.');
    return {
      email: user.email || '',
      emailVerified: !!user.email_confirmed_at,
      providers: Array.from(
        new Set<string>((user.identities || []).map((i: { provider: string }) => i.provider)),
      ),
      lastSignInAt: user.last_sign_in_at || null,
      expiresAt: s.expires_at,
    };
  },
  async signOutOtherSessions(): Promise<void> {
    const s = await authorized();
    await request('/auth/v1/logout?scope=others', {}, s.access_token);
  },
  async updatePassword(password: string) {
    const s = await session();
    if (!s) throw new Error('Open the recovery link again.');
    await request('/auth/v1/user', { password }, s.access_token, 'PUT');
  },
  onChange(callback: (user: CloudUser | null) => void) {
    listeners.add(callback);
    const storage = (e: StorageEvent) => {
      if (e.key === storageKey) callback(asUser(read()?.user));
    };
    window.addEventListener('storage', storage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener('storage', storage);
    };
  },
};
async function authorized(expectedUserId?: string) {
  const s = await session();
  if (expectedUserId && s?.user?.id !== expectedUserId)
    throw new Error('Your signed-in account changed. Reload before saving this workspace.');
  if (!s) throw new Error('Sign in to save to the cloud or use live AI.');
  return s;
}
export async function loadWorkspace<T>(
  expectedUserId?: string,
): Promise<{ data: T; revision: number } | null> {
  const s = await authorized(expectedUserId);
  const rows = await request(
    '/rest/v1/architect_workspaces?select=data,revision',
    undefined,
    s.access_token,
  );
  return rows[0] || null;
}
export async function saveWorkspace(
  data: unknown,
  expectedRevision: number,
  expectedUserId?: string,
): Promise<number> {
  const s = await authorized(expectedUserId);
  if (new TextEncoder().encode(JSON.stringify(data)).length > 1000000)
    throw new Error(
      'Workspace exceeds the 1 MB demo limit. Export or remove large generated files.',
    );
  const result = await request(
    '/rest/v1/rpc/architect_save_workspace',
    { workspace_data: data, expected_revision: expectedRevision },
    s.access_token,
  );
  if (result.conflict)
    throw new Error(
      'This workspace changed in another tab. Reload before saving to avoid overwriting it.',
    );
  return result.revision;
}
export async function listModels(): Promise<ModelOption[]> {
  const r = await fetch('/api/models', { signal: AbortSignal.timeout(20000) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Model catalog unavailable.');
  return data.models;
}
export async function generate(
  input: {
    prompt: string;
    model?: string;
    mode?: 'app' | 'plan' | 'chat';
    context?: string;
    images?: { name?: string; dataUrl: string }[];
  },
  signal?: AbortSignal,
): Promise<GenerationResult> {
  const s = await authorized();
  const r = await fetch('/api/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
  let data;
  try {
    data = await r.json();
  } catch {
    throw new Error('The generation service is unavailable. Your prompt is preserved.');
  }
  if (!r.ok) throw new Error(data.error || 'Generation failed.');
  return data;
}

/** Authenticated, refreshed RPC. Never accepts an arbitrary bearer token. */
export async function authenticatedRPC<T>(
  name: string,
  args: Record<string, unknown> = {},
  expectedUserId?: string,
): Promise<T> {
  if (!/^architect_[a-z_]+$/.test(name)) throw new Error('Unsupported operation.');
  const s = await authorized(expectedUserId);
  return request(`/rest/v1/rpc/${name}`, args, s.access_token);
}
