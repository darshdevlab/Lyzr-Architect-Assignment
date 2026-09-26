import { defineConfig } from 'vite';
export default defineConfig({
  server: { host: '127.0.0.1', port: 4183, proxy: { '/api': 'http://127.0.0.1:4184' } },
  build: { sourcemap: false },
});
