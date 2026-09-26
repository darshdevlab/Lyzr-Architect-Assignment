import { method, freeModels, respond, fail } from './_lib/core.mjs';
export default async function handler(req, res) {
  try {
    method(req, 'GET');
    return respond(res, 200, {
      models: await freeModels(),
      routing:
        'Free models only; automatic selection is capability-based, not a quality guarantee.',
    });
  } catch (e) {
    return fail(res, e);
  }
}
