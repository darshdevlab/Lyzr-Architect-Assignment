import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = path.resolve('dist');
const routes = {
  generate: (await import(pathToFileURL(path.resolve('api/generate.js')))).default,
  models: (await import(pathToFileURL(path.resolve('api/models.js')))).default,
  health: (await import(pathToFileURL(path.resolve('api/health.js')))).default,
};
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('X-Frame-Options', 'DENY');
      if (url.pathname.startsWith('/api/')) {
        res.status = (n) => {
          res.statusCode = n;
          return res;
        };
        res.json = (d) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(d));
        };
        const fn = routes[url.pathname.slice(5)];
        if (!fn) return res.status(404).json({ error: 'Not found' });
        const chunks = [];
        let length = 0;
        for await (const c of req) {
          length += c.length;
          if (length > 4000000) return res.status(413).json({ error: 'Request too large' });
          chunks.push(c);
        }
        try {
          req.body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
        return await fn(req, res);
      }
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405);
        return res.end();
      }
      let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403);
        return res.end();
      }
      try {
        if (!(await stat(file)).isFile()) file = path.join(root, 'index.html');
      } catch {
        file = path.join(root, 'index.html');
      }
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch {
      if (!res.headersSent) res.writeHead(500);
      res.end('Request failed');
    }
  })
  .listen(Number(process.env.PORT) || 8080, '0.0.0.0', () =>
    console.log('Architect web prototype ready'),
  );
