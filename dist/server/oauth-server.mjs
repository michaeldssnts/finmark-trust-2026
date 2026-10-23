#!/usr/bin/env node
/*
 * GitHub sign-in for the content manager when the site runs on our own server instead of Netlify.
 * On Netlify, Netlify does this step; on our own server this tiny service does the same job. No packages needed (Node 18+).
 *
 *   GITHUB_CLIENT_ID=… GITHUB_CLIENT_SECRET=… node server/oauth-server.mjs
 *
 * nginx forwards https://finmark.org.za/oauth/* to it (set up by server/finmark.sh). In the GitHub OAuth app
 * ("FinMark Trust CMS"), set the Authorization callback URL to https://finmark.org.za/oauth/callback
 * "sudo finmark setup" installs it as a service; "sudo finmark cms-login" saves the two GitHub values.
 */
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const PORT = +process.env.PORT || 8787;
const ID = process.env.GITHUB_CLIENT_ID, SECRET = process.env.GITHUB_CLIENT_SECRET;
const SITE = process.env.SITE_ORIGIN || 'https://finmark.org.za';
if (!ID || !SECRET) { console.error('Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET'); process.exit(1); }
const states = new Map();

// The content manager window waits for this exact message from the sign-in pop-up.
const reply = (res, status, content) => {
  const msg = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(`<!doctype html><meta charset="utf-8"><title>Signing in…</title><p>Signing in…</p><script>
    (function () {
      function done(e) { if (e.origin !== ${JSON.stringify(SITE)}) return; window.opener.postMessage(${msg}, e.origin); window.removeEventListener('message', done); setTimeout(function () { window.close(); }, 300); }
      window.addEventListener('message', done, false);
      window.opener && window.opener.postMessage('authorizing:github', ${JSON.stringify(SITE)});
    })();
  </script>`);
};

createServer(async (req, res) => {
  const url = new URL(req.url, SITE);
  if (url.pathname === '/oauth/auth') {
    const state = randomBytes(16).toString('hex');
    states.set(state, Date.now());
    for (const [k, t] of states) if (Date.now() - t > 600000) states.delete(k);
    const to = new URL('https://github.com/login/oauth/authorize');
    to.search = new URLSearchParams({ client_id: ID, redirect_uri: `${SITE}/oauth/callback`, scope: url.searchParams.get('scope') || 'repo,user', state });
    res.writeHead(302, { Location: to.toString() }); return res.end();
  }
  if (url.pathname === '/oauth/callback') {
    const code = url.searchParams.get('code'), state = url.searchParams.get('state');
    if (!code || !states.delete(state)) return reply(res, 'error', { message: 'Sign-in expired. Please try again.' });
    try {
      const r = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: ID, client_secret: SECRET, code, redirect_uri: `${SITE}/oauth/callback` }) });
      const j = await r.json();
      return j.access_token ? reply(res, 'success', { token: j.access_token, provider: 'github' }) : reply(res, 'error', { message: j.error_description || 'GitHub did not return a token' });
    } catch (e) { return reply(res, 'error', { message: 'Could not reach GitHub' }); }
  }
  res.writeHead(404); res.end('Not found');
}).listen(PORT, '127.0.0.1', () => console.log(`CMS sign-in service on 127.0.0.1:${PORT}`));
