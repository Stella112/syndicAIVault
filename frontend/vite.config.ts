import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import https from 'https';

const CANTON_BASE = 'https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services';

/**
 * Custom Vite plugin: POST /api/active-contracts-page
 * → server-side GET /v2/state/active-contracts-page on Canton (with JSON body).
 * This bypasses the browser restriction on GET + body.
 */
function cantonGetWithBodyPlugin(): Plugin {
  return {
    name: 'canton-get-with-body',
    configureServer(server) {
      server.middlewares.use('/api/active-contracts-page', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }

        let rawBody = '';
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', () => {
          const authHeader = req.headers['authorization'] ?? '';
          const url = new URL(`${CANTON_BASE}/v2/state/active-contracts-page`);
          const bodyBuf = Buffer.from(rawBody, 'utf8');

          const options = {
            hostname: url.hostname,
            path:     url.pathname,
            method:   'GET',
            headers: {
              'Authorization':  authHeader,
              'Content-Type':   'application/json',
              'Content-Length': bodyBuf.length,
            },
          };

          const upstream = https.request(options, (upRes) => {
            res.statusCode = upRes.statusCode ?? 200;
            upRes.pipe(res);
          });
          upstream.on('error', (err) => { res.statusCode = 502; res.end(err.message); });
          upstream.write(bodyBuf);
          upstream.end();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cantonGetWithBodyPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/ledger': {
        target: 'https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services:443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ledger/, ''),
        secure: true,
      },
      '/keycloak': {
        target: 'https://keycloak.naas.noders.services',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/keycloak/, ''),
        secure: true,
      },
    },
  },
});

