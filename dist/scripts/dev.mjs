#!/usr/bin/env node
/*
 * Local editing in one command:  npm run cms   (or: node scripts/dev.mjs)
 *   - serves this folder at http://localhost:8080
 *   - starts the Decap local backend (npx decap-server, port 8081) so /admin saves to these files
 *   - rebuilds knowledge-hub/knowledge.json whenever content changes
 * Then open http://localhost:8080/admin/ to edit and http://localhost:8080/knowledge-hub/ to see the result.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { spawn } from 'node:child_process';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// First run: create the CMS content files from the legacy export.
if (!existsSync(join(ROOT, 'content/knowledge'))) {
  console.log('No content/ folder yet: importing the legacy Knowledge Hub export…');
  execFileSync(process.execPath, [join(ROOT, 'scripts/import-legacy.mjs'), '--in', join(ROOT, 'legacy/hub-inventory.json')], { stdio: 'inherit' });
}
const PORT = Number(process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.yml': 'text/yaml', '.txt': 'text/plain' };

createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(ROOT, p);
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); }
}).listen(PORT, () => {
  console.log(`\nSite:    http://localhost:${PORT}/`);
  console.log(`Editor:  http://localhost:${PORT}/admin/`);
  console.log(`Hub:     http://localhost:${PORT}/knowledge-hub/\n`);
});

const run = (cmd, args) => { const p = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' }); p.on('exit', c => c && console.log(`${cmd} exited (${c})`)); return p; };
const kids = [run('npx', ['--yes', 'decap-server']), run(process.execPath, [join(ROOT, 'scripts/build-knowledge.mjs'), '--watch'])];
process.on('SIGINT', () => { kids.forEach(k => k.kill()); process.exit(0); });
