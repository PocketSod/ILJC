/**
 * mobile-shot.mjs — screenshot at 390px mobile viewport
 * Usage: node mobile-shot.mjs [url] [scrollY] [label]
 */
import http from 'http';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const shotDir = join(__dir, 'temporary screenshots');
mkdirSync(shotDir, { recursive: true });

const url    = process.argv[2] || 'http://localhost:3001';
const scrollY = parseInt(process.argv[3] || '0');
const label  = process.argv[4] || 'mobile';
const outPath = join(shotDir, `mobile-${label}.png`);

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DBG_PORT = 9224;

const proc = spawn(EDGE, [
  `--remote-debugging-port=${DBG_PORT}`,
  '--headless', '--disable-gpu', '--no-sandbox',
  '--disable-extensions',
  '--window-size=390,844',
  url,
], { stdio: 'ignore', detached: false });

const delay = ms => new Promise(r => setTimeout(r, ms));
await delay(3000);

const targets = await new Promise((res, rej) => {
  http.get(`http://localhost:${DBG_PORT}/json`, r => {
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { rej(e); } });
  }).on('error', rej);
});

const target = targets.find(t => t.type === 'page');
if (!target) throw new Error('No page target found');

const ws = new WebSocket(target.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();

ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++msgId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

await new Promise(r => ws.addEventListener('open', r));
await send('Runtime.enable');

await send('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true
});

if (scrollY > 0) {
  await send('Runtime.evaluate', {
    expression: `window.scrollTo(0, ${scrollY})`
  });
  await delay(600);
}

const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
writeFileSync(outPath, Buffer.from(data, 'base64'));
console.log(`Saved: ${outPath}`);

ws.close();
proc.kill();
process.exit(0);
