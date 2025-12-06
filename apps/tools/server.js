import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import sirv from 'sirv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize static file server for client assets
const assetsHandler = sirv(join(__dirname, 'dist/client'), {
  maxAge: 31536000, // 1 year
  immutable: true,
  gzip: true,
  brotli: true // if available
});

// Import the TanStack Start server
const imported = await import('./dist/server/server.js');
const handler = imported.default || imported.handler;

console.log('Server imported keys:', Object.keys(imported));

// The handler is likely an object with a fetch method (like { fetch: ... })
// We need to adapt Node.js (req, res) -> Web (Request, Response)
const fetchHandler = handler.fetch || (typeof handler === 'function' ? handler : null);

if (!fetchHandler) {
  console.error('Failed to find fetch handler. Exported:', handler);
  process.exit(1);
}

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const server = createServer(async (req, res) => {
  // First try to serve static assets
  assetsHandler(req, res, async () => {
    // If not handled by sirv (next() called), proceed to SSR
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const url = new URL(req.url, `${protocol}://${req.headers.host}`);
      
      // Create Web Request from Node req
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else if (value) {
          headers.append(key, value);
        }
      }

      const request = new Request(url, {
        method: req.method,
        headers,
        body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined,
        // @ts-ignore - duplex is needed for streaming bodies in Node 18+
        duplex: 'half' 
      });

      // Call the handler
      const response = await fetchHandler(request);
      
      // Copy response to Node.js response
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();
    } catch (error) {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
