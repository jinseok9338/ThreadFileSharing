import http from 'http';
import path from 'path';
import fs from 'fs';
import url from 'url';

const port = process.env.PORT || 8001;
const publicPath = process.cwd();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // SPA routing - serve index.html for non-asset requests
  if (pathname === '/' || (!path.extname(pathname) && !pathname.startsWith('/assets'))) {
    pathname = '/index.html';
  }
  
  const filePath = path.join(publicPath, pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, serve index.html (SPA fallback)
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(publicPath, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('404 - File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('500 - Internal Server Error');
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});