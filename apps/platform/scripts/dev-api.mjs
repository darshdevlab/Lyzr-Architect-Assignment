import http from 'node:http';
try {
  process.loadEnvFile('.env');
} catch {}
const routes = {
  generate: (await import('../api/generate.js')).default,
  models: (await import('../api/models.js')).default,
  health: (await import('../api/health.js')).default,
};
http
  .createServer(async (req, res) => {
    const route = req.url.split('?')[0].split('/').pop();
    const handler = routes[route];
    res.status = (n) => {
      res.statusCode = n;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    if (!handler) return res.status(404).json({ error: 'Not found' });
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 4000000) {
        res.status(413).json({ error: 'Request too large' });
        return;
      }
      chunks.push(chunk);
    }
    try {
      req.body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
      await handler(req, res);
    } catch {
      if (!res.writableEnded) res.status(500).json({ error: 'Local service failed' });
    }
  })
  .listen(4184, '127.0.0.1', () => console.log('Local API ready on 4184'));
