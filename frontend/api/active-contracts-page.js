const https = require('https');

/**
 * Vercel Serverless Function
 * POST /api/active-contracts-page
 * Translates into a GET request with a JSON body to the Canton Ledger.
 * Native fetch() strictly prohibits GET requests with bodies, 
 * so we use the low-level 'https' module just like the Vite proxy.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const CANTON_BASE = 'https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services';
  const url = new URL(`${CANTON_BASE}/v2/state/active-contracts-page`);
  const authHeader = req.headers.authorization || '';

  // Vercel automatically parses JSON bodies. We need it as a string buffer for https.request.
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const bodyBuf = Buffer.from(rawBody, 'utf8');

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Content-Length': bodyBuf.length,
    },
  };

  return new Promise((resolve) => {
    const upstream = https.request(options, (upRes) => {
      res.status(upRes.statusCode || 200);
      
      // Pass the headers back to the client
      for (const [key, value] of Object.entries(upRes.headers)) {
        res.setHeader(key, value);
      }

      // Stream the response directly to the client
      upRes.pipe(res);
      upRes.on('end', resolve);
    });

    upstream.on('error', (err) => {
      console.error('Canton Proxy Error:', err);
      res.status(502).send(err.message);
      resolve();
    });

    // Write the body to the GET request (violates strict REST, required by Canton JSON API)
    upstream.write(bodyBuf);
    upstream.end();
  });
};
