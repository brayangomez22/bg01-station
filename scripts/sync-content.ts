/**
 * Build-time content sync (run with tsx, by CI before the build).
 *
 * Fetches the full content bundle from the API's public /export endpoint and
 * writes it to src/content/_generated/*.json, which src/content/* reads. This
 * is how edits made in /control reach the public static site.
 *
 * Resilient by design: if the API is unreachable, it logs a warning and exits
 * 0, leaving the committed JSON (the last good snapshot) in place so a deploy
 * never hard-fails on API downtime.
 *
 *   API_BASE=https://api.brayangomez.dev npx tsx scripts/sync-content.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.API_BASE ?? 'http://localhost:8080';

interface ArchiveRecord {
  body: unknown;
  refs: unknown;
  [k: string]: unknown;
}
interface Export {
  pilot: unknown;
  missions: unknown;
  technologies: unknown;
  experience: unknown;
  training: unknown;
  frequencies: unknown;
  archive: { sections: unknown; records: ArchiveRecord[] };
  siteCopy: unknown;
}

const outDir = fileURLToPath(new URL('../src/content/_generated/', import.meta.url));

async function main(): Promise<void> {
  let bundle: Export;
  try {
    const res = await fetch(`${BASE}/export`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    bundle = (await res.json()) as Export;
  } catch (err) {
    console.warn(
      `⚠ sync-content: API at ${BASE} unreachable (${String(err)}); ` +
        `keeping committed content snapshot.`,
    );
    return; // exit 0 — fall back to committed JSON
  }

  mkdirSync(outDir, { recursive: true });
  const write = (name: string, data: unknown) => {
    writeFileSync(`${outDir}${name}.json`, JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✓ ${name}.json`);
  };

  // Archive: split meta (eager chunk) from full records (lazy chunk), matching
  // how the frontend modules consume them.
  const manifest = bundle.archive.records.map(({ body, refs, ...meta }) => meta);

  console.log(`Syncing content from ${BASE}/export`);
  write('pilot', bundle.pilot);
  write('missions', bundle.missions);
  write('technologies', bundle.technologies);
  write('experience', bundle.experience);
  write('training', bundle.training);
  write('frequencies', bundle.frequencies);
  write('archive-sections', bundle.archive.sections);
  write('archive-manifest', manifest);
  write('archive-records', bundle.archive.records);
  write('site-copy', bundle.siteCopy ?? {});
  console.log('Done.');
}

await main();
