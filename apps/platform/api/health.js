import { method, config, respond, fail } from './_lib/core.mjs';
export default function handler(req, res) {
  try {
    method(req, 'GET');
    const c = config();
    return respond(res, 200, {
      status: 'ok',
      authConfigured: !!(c.url && c.key),
      aiConfigured: !!c.openRouter,
      liveAIRequiresSignIn: true,
    });
  } catch (e) {
    return fail(res, e);
  }
}
