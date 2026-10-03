import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import jari from '../api/jari.js';
import status from '../api/status.js';
delete process.env.OPENAI_API_KEY;
delete process.env.GEMINI_API_KEY;
async function invoke(handler, method, body, extra = {}) {
  const req = { method, body, headers: { host: 'study.example', ...extra } };
  const res = { headers: {}, setHeader(k,v) { this.headers[k] = v; }, end(b) { this.body = JSON.parse(b.toString()); } };
  await handler(req, res);
  return res;
}
assert.equal((await invoke(status, 'GET')).body.connected, false);
const reply = await invoke(jari, 'POST', { message: 'Churrasco', mode: 'qa' }, { origin: 'https://study.example' });
assert.equal(reply.statusCode, 200);
assert.match(reply.body.reply, /Churrasco/i);
assert.equal((await invoke(jari, 'POST', { message: 'Churrasco' }, { origin: 'https://other.example' })).statusCode, 403);
assert.equal((await invoke(jari, 'GET')).statusCode, 405);
assert.equal((await invoke(jari, 'POST', { message: '' })).statusCode, 400);
const catalog = JSON.parse(await readFile('public/catalog.json', 'utf8'));
const photos = JSON.parse(await readFile('source/images.json', 'utf8'));
for (const name of Object.keys(photos)) assert.ok((await readFile(`public/media/${name}.jpg`)).length > 0);
console.log(`Vercel adapter verified; ${catalog.length} items and ${Object.keys(photos).length} images.`);
