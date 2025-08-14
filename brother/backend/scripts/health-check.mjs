import http from 'node:http';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT) || 4000;

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host, port, path, method: 'GET', timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    req.end();
  });
}

(async () => {
  try {
    const res = await request('/health');
    console.log('GET /health', res.statusCode, res.body);
  } catch (err) {
    console.error('Health check failed:', err.message);
    process.exitCode = 1;
  }
})();
