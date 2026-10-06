import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || process.argv[2] || '3011', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');
const FILE_CACHE = new Map();
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.wasm']);


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

  if (req.method === 'POST' && req.url === '/save-badge') {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        const { file, base64 } = JSON.parse(data);
        const target = path.join(DIST_DIR, 'logos', file);
        fs.writeFileSync(target, Buffer.from(base64, 'base64'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, file }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
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
    if (err || !stats.isFile()) {
      // If file not found, try fallback or 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const etag = `W/"${stats.size}-${Math.floor(stats.mtimeMs)}"`;
    const accept = String(req.headers['accept-encoding'] || '');
    const enc = COMPRESSIBLE.has(ext) ? (/\bbr\b/.test(accept) ? 'br' : (/\bgzip\b/.test(accept) ? 'gzip' : '')) : '';

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-cache' });
      res.end();
      return;
    }

    const send = (body) => {
      const headers = {
        'Content-Type': contentType,
        'Content-Length': body.length,
        'Cache-Control': 'no-cache',
        'ETag': etag,
        'Vary': 'Accept-Encoding'
      };
      if (enc) headers['Content-Encoding'] = enc;
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    };

    const key = `${safePath}|${enc}`;
    const hit = FILE_CACHE.get(key);
    if (hit && hit.etag === etag) {
      send(hit.body);
      return;
    }

    fs.readFile(safePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const done = (body) => {
        FILE_CACHE.set(key, { etag, body });
        send(body);
      };
      if (enc === 'br') {
        zlib.brotliCompress(data, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (e, out) => done(e ? data : out));
      } else if (enc === 'gzip') {
        zlib.gzip(data, { level: 6 }, (e, out) => done(e ? data : out));
      } else {
        done(data);
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
