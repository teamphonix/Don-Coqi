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
const originalFetch = globalThis.fetch;
process.env.GEMINI_API_KEY = 'test-only';
for (const code of [400, 403, 404, 429]) {
  globalThis.fetch = async () => new Response(JSON.stringify({error:{message:'private-key-must-not-leak',details:code===429?[{violations:[{quotaValue:'0'}]}]:[]}}), {status:code, headers:{'Content-Type':'application/json'}});
  const result = await invoke(jari, 'POST', {message:'Churrasco'});
  assert.equal(result.body.upstreamStatus, code);
  assert.ok(!JSON.stringify(result.body).includes('private-key-must-not-leak'));
  if(code===429) assert.equal(result.body.zeroQuota, true);
}
globalThis.fetch = async () => new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Guest: What do you recommend?'}]}}]}), {status:200});
assert.equal((await invoke(jari, 'POST', {message:'Start a table',mode:'mock'})).body.provider, 'gemini');
globalThis.fetch = originalFetch;
delete process.env.GEMINI_API_KEY;
const photos = JSON.parse(await readFile('source/images.json', 'utf8'));
for (const name of Object.keys(photos)) assert.ok((await readFile(`public/media/${name}.jpg`)).length > 0);
console.log(`Vercel adapter verified; ${catalog.length} items and ${Object.keys(photos).length} images.`);
