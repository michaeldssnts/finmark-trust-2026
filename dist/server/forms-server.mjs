#!/usr/bin/env node
/*
 * Website forms for FinMark Trust: "Download dataset" and "Contact us". No packages needed (Node 18+).
 *
 * - Submissions are kept privately on this server (never in GitHub or the content manager), in
 *   /var/lib/finmark-forms/submissions.jsonl, readable only by this service.
 * - Dataset requests get the download link by email, sent through Microsoft 365 (Microsoft Graph) from
 *   the data mailbox. FMT gets an alert email for every submission.
 * - The "Submissions" page in /admin/ reads them, after checking the person's GitHub sign-in can edit the site.
 *
 * nginx forwards https://finmark.org.za/api/* here. "sudo finmark email-setup" saves the Microsoft 365 details.
 * Test the email settings:  node forms-server.mjs --test-email someone@finmark.org.za
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { join } from 'node:path';

const E = process.env;
const PORT = +E.PORT || 8788;
const SITE = E.SITE_ORIGIN || 'https://finmark.org.za';
const DIR = E.STATE_DIRECTORY || E.DATA_DIR || '/var/lib/finmark-forms';
const FILE = join(DIR, 'submissions.jsonl');
const DATASETS = E.DATASETS_FILE || '/var/www/finmark/current/server/datasets.json';
const REPO = E.GITHUB_REPO || '';
const FROM = E.MAIL_FROM || 'data@finmark.org.za';
const ALERT = (E.ALERT_TO || '').split(/[,;\s]+/).filter(Boolean);
const MAIL_ON = !!(E.MAIL_TENANT_ID && E.MAIL_CLIENT_ID && E.MAIL_CLIENT_SECRET);

// ---------- email via Microsoft Graph ----------
let tok = null;
async function graphToken() {
  if (tok && tok.exp > Date.now() + 60000) return tok.value;
  const r = await fetch(`https://login.microsoftonline.com/${E.MAIL_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: E.MAIL_CLIENT_ID, client_secret: E.MAIL_CLIENT_SECRET, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' })
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Microsoft sign-in failed: ' + (j.error_description || j.error || r.status));
  tok = { value: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tok.value;
}
async function sendMail(to, subject, html, replyTo) {
  if (!MAIL_ON) throw new Error('Email is not set up yet (sudo finmark email-setup)');
  const message = { subject, body: { contentType: 'HTML', content: html }, toRecipients: [].concat(to).map(a => ({ emailAddress: { address: a } })) };
  if (replyTo) message.replyTo = [{ emailAddress: { address: replyTo } }];
  const r = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(FROM)}/sendMail`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + await graphToken(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, saveToSentItems: true })
  });
  if (r.status !== 202) throw new Error('Email not sent: ' + r.status + ' ' + (await r.text()).slice(0, 300));
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wrap = inner => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#213265;max-width:600px">${inner}
  <p style="margin-top:28px;font-size:12px;color:#5b6b84">FinMark Trust · Making financial markets work for the poor · <a href="${SITE}" style="color:#0098ae">finmark.org.za</a></p></div>`;

// --test-email: check the Microsoft 365 settings from the command line
if (process.argv[2] === '--test-email') {
  const to = process.argv[3] || ALERT[0];
  if (!to) { console.error('Give an address: --test-email name@finmark.org.za'); process.exit(1); }
  sendMail(to, 'FinMark Trust website: test email', wrap('<p>This is a test from the website server. Email from the website is working.</p>'))
    .then(() => { console.log('Sent to ' + to); process.exit(0); }, e => { console.error(e.message); process.exit(1); });
} else start();

function start() {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  let ROWS = existsSync(FILE) ? readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
  const save = row => { ROWS.push(row); appendFileSync(FILE, JSON.stringify(row) + '\n', { mode: 0o600 }); };
  const rewrite = () => { writeFileSync(FILE + '.tmp', ROWS.map(r => JSON.stringify(r)).join('\n') + (ROWS.length ? '\n' : ''), { mode: 0o600 }); renameSync(FILE + '.tmp', FILE); };
  const update = (id, patch) => { const r = ROWS.find(x => x.id === id); if (r) { Object.assign(r, patch); rewrite(); } };

  const datasets = () => { try { return JSON.parse(readFileSync(DATASETS, 'utf8')).datasets || []; } catch { return []; } };

  // ---------- simple protection ----------
  const hits = new Map();
  const limited = ip => { const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 3600000); list.push(now); hits.set(ip, list); return list.length > 8; };
  const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
  const isEmail = v => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v);

  // ---------- admin sign-in: the same GitHub sign-in as the content manager ----------
  const okTokens = new Map();
  async function isEditor(req) {
    const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!t || !REPO) return false;
    const key = createHash('sha256').update(t).digest('hex'), c = okTokens.get(key);
    if (c && c.exp > Date.now()) return c.user;
    const r = await fetch(`https://api.github.com/repos/${REPO}`, { headers: { Authorization: 'Bearer ' + t, 'User-Agent': 'finmark-forms', Accept: 'application/vnd.github+json' } });
    if (!r.ok) return false;
    const j = await r.json();
    if (!(j.permissions && (j.permissions.push || j.permissions.admin))) return false;
    const u = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + t, 'User-Agent': 'finmark-forms' } }).then(x => x.json()).catch(() => ({}));
    okTokens.set(key, { user: u.login || 'editor', exp: Date.now() + 600000 });
    return u.login || 'editor';
  }

  const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  const body = req => new Promise((ok, no) => { let b = ''; req.on('data', d => { b += d; if (b.length > 20000) { no(new Error('too big')); req.destroy(); } }); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { no(e); } }); });

  async function alert(row) {
    if (!ALERT.length) throw new Error('No alert address set (sudo finmark email-setup)');
    const lines = Object.entries(row).filter(([k]) => !['id', 'emailed', 'emailError'].includes(k)).map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#5b6b84">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('');
    const what = row.type === 'dataset' ? `Dataset request: ${row.survey} ${row.country} ${row.year}` : `Website enquiry: ${row.topic}`;
    await sendMail(ALERT, what, wrap(`<p><b>${esc(what)}</b></p><table style="font-size:14px">${lines}</table><p><a href="${SITE}/admin/submissions.html">Open Submissions</a></p>`), row.email);
  }

  createServer(async (req, res) => {
    const url = new URL(req.url, SITE), ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    try {
      // ----- Download dataset -----
      if (req.method === 'POST' && url.pathname === '/api/forms/dataset') {
        const b = await body(req);
        if (b.website) return send(res, 200, { ok: true });                        // honeypot: quietly ignore bots
        if (limited(ip)) return send(res, 429, { error: 'Too many requests. Please try again in an hour.' });
        if (+b.elapsed > 0 && +b.elapsed < 3000) return send(res, 200, { ok: true });
        const row = { id: randomUUID(), type: 'dataset', at: new Date().toISOString(), first: clean(b.first, 80), last: clean(b.last, 80), email: clean(b.email, 160).toLowerCase(),
          organisation: clean(b.organisation, 160), orgType: clean(b.orgType, 80), use: clean(b.use, 2000), survey: clean(b.survey, 40), iso: clean(b.iso, 3).toUpperCase(), year: clean(b.year, 4), terms: !!b.terms };
        if (!row.first || !row.last || !isEmail(row.email) || !row.organisation || row.use.length < 15 || !row.terms) return send(res, 400, { error: 'Please complete all the fields.' });
        const ds = datasets().find(d => d.survey === row.survey && d.iso === row.iso && String(d.year) === row.year);
        if (!ds || !ds.url) return send(res, 404, { error: 'That dataset is not available to download. Please contact us.' });
        row.country = ds.country;
        save(row);
        const label = `FinScope ${ds.survey === 'msme' ? 'MSME' : 'Consumer'} ${ds.country} ${ds.year}`;
        try {
          await sendMail(row.email, `Your ${label} dataset`, wrap(`<p>Dear ${esc(row.first)},</p><p>Thank you for your interest in FinScope. Your dataset is ready to download:</p>
            <p><a href="${esc(ds.url)}" style="display:inline-block;background:#0098ae;color:#fff;padding:10px 18px;text-decoration:none;font-weight:bold">Download ${esc(label)}</a></p>
            <p style="font-size:13px;color:#5b6b84">Or copy this link: ${esc(ds.url)}</p>
            <p>Please cite: FinMark Trust (${esc(ds.year)}). ${esc(label)} survey.</p><p>Kind regards,<br>The FinMark Trust data team</p>`));
          update(row.id, { emailed: true });
        } catch (e) { update(row.id, { emailed: false, emailError: e.message.slice(0, 200) }); console.error(e.message); }
        alert(row).catch(e => console.error('alert: ' + e.message));
        return send(res, 200, { ok: true, emailed: !!row.emailed });
      }
      // ----- Contact us -----
      if (req.method === 'POST' && url.pathname === '/api/forms/contact') {
        const b = await body(req);
        if (b.website) return send(res, 200, { ok: true });
        if (limited(ip)) return send(res, 429, { error: 'Too many messages. Please try again in an hour.' });
        if (+b.elapsed > 0 && +b.elapsed < 3000) return send(res, 200, { ok: true });
        const row = { id: randomUUID(), type: 'contact', at: new Date().toISOString(), name: clean(b.name, 120), organisation: clean(b.organisation, 160), email: clean(b.email, 160).toLowerCase(), topic: clean(b.topic, 80), message: clean(b.message, 5000) };
        if (!row.name || !isEmail(row.email) || !row.message) return send(res, 400, { error: 'Please complete all the fields.' });
        save(row);
        try { await alert(row); update(row.id, { emailed: true }); } catch (e) { update(row.id, { emailed: false, emailError: e.message.slice(0, 200) }); console.error(e.message); }
        return send(res, 200, { ok: true });
      }
      // ----- Submissions page (signed-in editors only) -----
      if (url.pathname.startsWith('/api/admin/')) {
        const who = await isEditor(req);
        if (!who) return send(res, 401, { error: 'Sign in to the content manager first.' });
        if (req.method === 'GET' && url.pathname === '/api/admin/submissions') return send(res, 200, { user: who, mail: MAIL_ON, rows: ROWS.slice().reverse() });
        const m = url.pathname.match(/^\/api\/admin\/submissions\/([\w-]+)$/);
        if (req.method === 'DELETE' && m) { const n = ROWS.length; ROWS = ROWS.filter(r => r.id !== m[1]); rewrite(); console.log(`deleted ${m[1]} by ${who}`); return send(res, 200, { ok: n !== ROWS.length }); }
        if (req.method === 'POST' && m && url.searchParams.get('resend') === '1') {
          const r = ROWS.find(x => x.id === m[1]); if (!r || r.type !== 'dataset') return send(res, 404, { error: 'Not found' });
          const ds = datasets().find(d => d.survey === r.survey && d.iso === r.iso && String(d.year) === r.year);
          if (!ds) return send(res, 404, { error: 'Dataset no longer listed' });
          await sendMail(r.email, `Your FinScope ${r.country} ${r.year} dataset`, wrap(`<p>Dear ${esc(r.first)},</p><p>Here is your dataset link again: <a href="${esc(ds.url)}">${esc(ds.url)}</a></p><p>Kind regards,<br>The FinMark Trust data team</p>`));
          update(r.id, { emailed: true, emailError: undefined }); return send(res, 200, { ok: true });
        }
      }
      send(res, 404, { error: 'Not found' });
    } catch (e) { console.error(e); send(res, 500, { error: 'Something went wrong. Please try again, or email info@finmark.org.za.' }); }
  }).listen(PORT, '127.0.0.1', () => console.log(`Forms service on 127.0.0.1:${PORT} (email ${MAIL_ON ? 'on' : 'not set up'}, ${ROWS.length} submissions)`));
}
