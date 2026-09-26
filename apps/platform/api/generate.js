import {
  method,
  validateInput,
  authenticated,
  generateResult,
  respond,
  fail,
} from './_lib/core.mjs';
export const config = { maxDuration: 120 };
export default async function handler(req, res) {
  try {
    method(req, 'POST');
    const input = validateInput(req.body);
    const session = await authenticated(req);
    return respond(res, 200, await generateResult(input, session));
  } catch (e) {
    return fail(res, e);
  }
}
