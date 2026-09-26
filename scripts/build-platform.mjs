import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const edition = process.argv[2];
if (!['2', '3', '4'].includes(edition)) throw new Error('Choose edition 2, 3 or 4');
const cwd = fileURLToPath(new URL('../apps/platform/', import.meta.url));
for (const args of [
  ['exec', 'tsc', '-b'],
  ['exec', 'vite', 'build', '--outDir', `dist/edition-${edition}`],
]) {
  const result = spawnSync('pnpm', args, {
    cwd,
    env: { ...process.env, VITE_EDITION: edition },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status) process.exit(result.status);
}
