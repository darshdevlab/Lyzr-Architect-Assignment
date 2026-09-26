import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const key = 'architect.cloud.session.v1';
function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
    removeItem: (k: string) => data.delete(k),
    clear: () => data.clear(),
  };
}
async function harness(href = 'https://architect.test/?project=p1&view=studio') {
  const local = memory(),
    session = memory();
  let current = new URL(href);
  const calls: { url: string; body: any; method: string }[] = [];
  const location = {
    get href() {
      return current.href;
    },
    get origin() {
      return current.origin;
    },
    get pathname() {
      return current.pathname;
    },
    get search() {
      return current.search;
    },
    get hash() {
      return current.hash;
    },
    assign: (value: string) => {
      current = new URL(value, current);
    },
  };
  Object.assign(globalThis, {
    localStorage: local,
    sessionStorage: session,
    location,
    history: {
      replaceState: (_s: unknown, _t: string, path: string) => {
        current = new URL(path, current);
      },
    },
    window: { addEventListener() {}, removeEventListener() {} },
  });
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  let respond: (url: string, body: any) => unknown = () => ({
    id: 'u1',
    email: 'person@example.invalid',
  });
  globalThis.fetch = (async (input: any, init: any) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(init.body) : undefined;
    calls.push({ url, body, method: init?.method });
    const result = await respond(url, body);
    if (result instanceof Response) return result;
    return Response.json(result);
  }) as typeof fetch;
  const source = await readFile(new URL('../src/lib/cloud.ts', import.meta.url), 'utf8');
  // Replace the Vite environment expression structurally, independent of source formatting.
  let replacedEnvironment = false;
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    transformers: {
      before: [
        (context) => (root) => {
          const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
            let expression = ts.isPropertyAccessExpression(node) ? node.expression : undefined;
            while (
              expression &&
              (ts.isParenthesizedExpression(expression) ||
                ts.isAsExpression(expression) ||
                ts.isTypeAssertionExpression(expression))
            )
              expression = expression.expression;
            if (
              ts.isPropertyAccessExpression(node) &&
              node.name.text === 'env' &&
              expression &&
              ts.isMetaProperty(expression) &&
              expression.keywordToken === ts.SyntaxKind.ImportKeyword
            ) {
              replacedEnvironment = true;
              return ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                  'VITE_SUPABASE_URL',
                  ts.factory.createStringLiteral('https://cloud.test'),
                ),
                ts.factory.createPropertyAssignment(
                  'VITE_SUPABASE_ANON_KEY',
                  ts.factory.createStringLiteral('test-publishable'),
                ),
              ]);
            }
            return ts.visitEachChild(node, visit, context);
          };
          return ts.visitNode(root, visit) as ts.SourceFile;
        },
      ],
    },
  }).outputText;
  assert.equal(replacedEnvironment, true, 'Auth harness must inject its isolated environment');
  const api = await import(
    'data:text/javascript;base64,' + Buffer.from(js + '\n// ' + Math.random()).toString('base64')
  );
  const valid = {
    access_token: 'token-test',
    refresh_token: 'refresh-test',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: 'u1', email: 'person@example.invalid' },
  };
  return {
    api,
    local,
    session,
    calls,
    location,
    valid,
    respond: (f: typeof respond) => {
      respond = f;
    },
  };
}
test('temporary refresh failures keep the session, emit no logout, and can retry', async () => {
  const h = await harness();
  h.local.setItem(key, JSON.stringify({ ...h.valid, expires_at: 1 }));
  const changes: any[] = [];
  h.api.auth.onChange((u: any) => changes.push(u));
  h.respond(
    () => new Response(JSON.stringify({ message: 'upstream unavailable' }), { status: 503 }),
  );
  await assert.rejects(h.api.auth.getUser(), /could not be refreshed/);
  assert.ok(h.local.getItem(key));
  assert.deepEqual(changes, []);
  h.respond((url) => (url.includes('/token') ? h.valid : h.valid.user));
  assert.equal((await h.api.auth.getUser()).id, 'u1');
  assert.equal(changes.length, 1);
});
test('definitively revoked refresh token clears auth, unlike a network outage', async () => {
  const h = await harness();
  h.local.setItem(key, JSON.stringify({ ...h.valid, expires_at: 1 }));
  h.respond(
    () =>
      new Response(JSON.stringify({ code: 'refresh_token_not_found', message: 'revoked' }), {
        status: 400,
      }),
  );
  assert.equal(await h.api.auth.getUser(), null);
  assert.equal(h.local.getItem(key), null);
});
test('refresh does not overwrite a different account that signs in while it is pending', async () => {
  const h = await harness();
  h.local.setItem(key, JSON.stringify({ ...h.valid, expires_at: 1 }));
  h.respond((url) => {
    if (url.includes('/token')) {
      h.local.setItem(
        key,
        JSON.stringify({
          ...h.valid,
          access_token: 'token-two',
          refresh_token: 'refresh-two',
          user: { id: 'u2' },
        }),
      );
      return h.valid;
    }
    return { id: 'u2' };
  });
  assert.equal((await h.api.auth.getUser()).id, 'u2');
  assert.equal(JSON.parse(h.local.getItem(key)!).access_token, 'token-two');
});
test('Google captures full same-origin work destination and invitation without leaking token in redirect', async () => {
  const invite = 'a'.repeat(64),
    h = await harness('https://architect.test/?join=company&view=people#invite=' + invite);
  await h.api.auth.signInWithGoogle();
  const redirect = new URL(h.location.href).searchParams.get('redirect_to');
  assert.equal(redirect, 'https://architect.test/?join=company&view=people');
  assert.equal(h.session.getItem('architect.pendingInvite'), invite);
  assert.equal(h.session.getItem('architect.auth.return'), '/?join=company&view=people');
  assert.ok(h.session.getItem('architect.pkce'));
});
test('OAuth restores work destination before listeners run, and retry retains PKCE on network failure', async () => {
  const h = await harness('https://architect.test/?code=auth-code');
  h.session.setItem('architect.pkce', 'verifier');
  h.session.setItem('architect.auth.return', '/?company=c1&project=p1&view=models');
  let attempts = 0;
  h.respond((url) => {
    if (url.includes('/token')) {
      if (!attempts++) throw new Error('offline');
      return h.valid;
    }
    return h.valid.user;
  });
  await assert.rejects(h.api.auth.getUser(), /offline/);
  assert.equal(h.session.getItem('architect.pkce'), 'verifier');
  let callbackPath = '';
  h.api.auth.onChange(() => {
    callbackPath = h.location.href;
  });
  await h.api.auth.getUser();
  assert.equal(callbackPath, 'https://architect.test/?company=c1&project=p1&view=models');
  assert.equal(h.session.getItem('architect.pkce'), null);
});
test('untrusted cross-origin return destination never becomes a redirect', async () => {
  const h = await harness('https://architect.test/?code=auth-code');
  h.session.setItem('architect.pkce', 'verifier');
  h.session.setItem('architect.auth.return', 'https://attacker.invalid/');
  h.respond((url) => (url.includes('/token') ? h.valid : h.valid.user));
  await h.api.auth.getUser();
  assert.equal(h.location.href, 'https://architect.test/');
});
test('recovery verifies callback and preserves work route while signaling reset before auth notification', async () => {
  const h = await harness(
    'https://architect.test/?project=p1&view=studio#access_token=recovery-token&refresh_token=recovery-refresh&type=recovery&expires_in=3600',
  );
  let route = '';
  h.api.auth.onChange(() => {
    route = h.location.href;
  });
  await h.api.auth.getUser();
  assert.equal(route, 'https://architect.test/?project=p1&view=studio&recovery=1');
  assert.ok(!h.location.hash);
});
test('confirmation resend and other-session logout call actual endpoints without dropping current account', async () => {
  const h = await harness();
  h.local.setItem(key, JSON.stringify(h.valid));
  h.respond(() => ({}));
  await h.api.auth.resendConfirmation(' person@example.invalid ');
  await h.api.auth.signOutOtherSessions();
  assert.deepEqual(h.calls[0].body, { type: 'signup', email: 'person@example.invalid' });
  assert.match(h.calls[0].url, /resend\?redirect_to=/);
  assert.match(h.calls[1].url, /logout\?scope=others$/);
  assert.ok(h.local.getItem(key));
});
test('security summary uses verified server user and reveals no access token', async () => {
  const h = await harness();
  h.local.setItem(key, JSON.stringify(h.valid));
  h.respond(() => ({
    email: 'verified@example.invalid',
    email_confirmed_at: '2026-01-01',
    identities: [{ provider: 'google' }, { provider: 'google' }, { provider: 'email' }],
    last_sign_in_at: '2026-09-27',
    access_token: 'must-not-leak',
  }));
  const summary = await h.api.auth.securitySummary();
  assert.equal(summary.emailVerified, true);
  assert.deepEqual(summary.providers, ['google', 'email']);
  assert.equal(summary.email, 'verified@example.invalid');
  assert.ok(!JSON.stringify(summary).includes('must-not-leak'));
});
