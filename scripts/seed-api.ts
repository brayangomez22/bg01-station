/**
 * One-shot bootstrap seeder (run with tsx).
 *
 * Reads the generated content bundle (src/content/_generated/*.json) and pushes
 * it into a running BG-01 API via the admin endpoints, so the database starts
 * life holding the current portfolio content. After this, the API is the source
 * of truth and editing happens through /control.
 *
 *   API_BASE=http://localhost:8080 SEED_PASSWORD='…' npx tsx scripts/seed-api.ts
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.API_BASE ?? 'http://localhost:8080';
const PASSWORD = process.env.SEED_PASSWORD;
if (!PASSWORD) {
  console.error('Set SEED_PASSWORD to the admin password.');
  process.exit(1);
}

const dir = fileURLToPath(new URL('../src/content/_generated/', import.meta.url));
const load = <T>(name: string): T =>
  JSON.parse(readFileSync(`${dir}${name}.json`, 'utf8')) as T;

// ── login ──────────────────────────────────────────────────────────────────
const loginRes = await fetch(`${BASE}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: PASSWORD }),
});
if (!loginRes.ok) {
  console.error(`Login failed: ${loginRes.status}`);
  process.exit(1);
}
const cookie = (loginRes.headers.get('set-cookie') ?? '').split(';')[0];
if (!cookie) {
  console.error('No session cookie returned.');
  process.exit(1);
}
console.log('✓ authenticated');

// ── helpers ──────────────────────────────────────────────────────────────────
const withOrder = <T extends object>(items: T[]): T[] =>
  items.map((item, i) => ({ order: i + 1, ...item }));

async function put(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE}/admin/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`PUT /admin/${path} → ${res.status}: ${await res.text()}`);
  }
}

async function seedList(resource: string, items: object[]): Promise<void> {
  for (const item of withOrder(items)) await put(resource, item);
  console.log(`✓ ${resource}: ${items.length}`);
}

// ── seed (sections before records for the FK) ────────────────────────────────
await put('pilot', load('pilot'));
console.log('✓ pilot');
await seedList('technologies', load('technologies'));
await seedList('missions', load('missions'));
await seedList('experiences', load('experience'));
await seedList('training', load('training'));
await seedList('frequencies', load('frequencies'));
await seedList('archive/sections', load('archive-sections'));
await seedList('archive/records', load('archive-records'));

const siteCopy = load<Record<string, string>>('site-copy');
for (const [key, value] of Object.entries(siteCopy)) await put('site-copy', { key, value });
if (Object.keys(siteCopy).length) console.log(`✓ site-copy: ${Object.keys(siteCopy).length}`);

console.log('\nDone. The database now holds the bootstrap content.');
