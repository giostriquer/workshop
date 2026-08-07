// Minimal static file server for previewing arch-map pages in-app.
// Usage: node serve.mjs [rootDir] [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '../../tmp');
const port = Number(process.argv[3] || 8791);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!fp.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(port, () => console.log(`serving ${root} → http://localhost:${port}/`));
