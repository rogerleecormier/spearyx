import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the TanStack Start server
const imported = await import('./dist/server/server.js');
const handler = imported.default || imported.handler;

console.log('Server imported:', imported);
console.log('Handler:', handler);

if (!handler) {
  console.error('Failed to import handler from ./dist/server/server.js');
  process.exit(1);
}

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const server = createServer(async (req, res) => {
  try {
    // Handle the request with TanStack Start
    const response = await handler(req);
    
    // Copy response to Node.js response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.statusCode = response.status;
    
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
