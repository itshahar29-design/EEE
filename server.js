// Zero-Dependency Static Web Server for Render.com & Local Hosting
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.jsx': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  // CORS headers if accessed from other origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path to prevent traversal
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  // Check if directory, serve index.html inside it
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(`<!DOCTYPE html>
<html>
<head><title>404 Topilmadi</title></head>
<body style="font-family:sans-serif; background:#090d16; color:#fff; text-align:center; padding:50px;">
  <h1>404 - Sahifa Topilmadi</h1>
  <p>So'ralgan fayl topilmadi: ${pathname}</p>
  <a href="/" style="color:#38bdf8;">Bosh sahifaga qaytish</a>
</body>
</html>`);
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Server xatosi: ${readErr.code}`);
        }
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 EDUMEMORY PRO - FRONTEND PLATFORMA SERVERI ISHGA TUSHDI!`);
  console.log(`🌐 Mahalliy manzil: http://localhost:${PORT}`);
  console.log(`🌐 Render domeni: https://edumemory-pro.onrender.com`);
  console.log(`📚 Jami Loyihalar: 200 ta (Real Portfolio Loyihalari)`);
  console.log(`🛠️ Server porti: ${PORT}`);
  console.log(`=======================================================`);
});
