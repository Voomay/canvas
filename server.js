const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || process.argv[2] || '3003', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  // CORS & basic headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Parse path and normalize
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  let safePath = path.normalize(path.join(DIST_DIR, pathname));

  // Guard against path traversal
  if (!safePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    const indexPath = path.join(safePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      safePath = indexPath;
    } else if (fs.existsSync(safePath + '.html')) {
      safePath = safePath + '.html';
    }
  } else if (!fs.existsSync(safePath) && fs.existsSync(safePath + '.html')) {
    safePath = safePath + '.html';
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      // If file not found, try fallback or 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    fs.readFile(safePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Cache-Control': 'no-cache'
      });

      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(data);
      }
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`=========================================`);
  console.log(` Voter Street Web Server running at:`);
  console.log(` > Local:    http://localhost:${PORT}/`);
  console.log(` > Network:  http://127.0.0.1:${PORT}/`);
  console.log(` Serving:   ${DIST_DIR}`);
  console.log(`=========================================`);
});
