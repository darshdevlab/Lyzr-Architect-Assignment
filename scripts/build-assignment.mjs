import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'apps/assignment');
const output = join(source, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'app.js', 'home-guide.js', 'architecture.js', 'style.css', 'config.json', 'data.json'])
  await cp(join(source, name), join(output, name));
await cp(join(root, 'docs/evidence/showcase-assets'), join(output, 'assets'), { recursive: true });
await cp(join(source, 'media'), join(output, 'media'), { recursive: true });
await cp(join(root, 'docs/architecture'), join(output, 'architecture'), { recursive: true });
console.log('Assignment assembled in apps/assignment/dist (curated evidence assets included).');
