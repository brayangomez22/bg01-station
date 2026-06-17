/**
 * One-shot bootstrap generator (run with tsx).
 *
 * Serializes the current hand-written content modules into per-resource JSON
 * under src/content/_generated/, in the same shape the API's /export emits.
 * After this, src/content/* reads the JSON and the API becomes the source of
 * truth; CI regenerates these files from /export on every publish.
 *
 *   npx tsx scripts/export-content.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { pilot } from '../src/content/pilot';
import { missions } from '../src/content/missions';
import { technologies } from '../src/content/technologies';
import { experience } from '../src/content/experience';
import { trainingSims } from '../src/content/training';
import { frequencies } from '../src/content/socials';
import { archiveSections } from '../src/content/archive/manifest';
import { archiveRecords } from '../src/content/archive/records';

const outDir = fileURLToPath(new URL('../src/content/_generated/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const write = (name: string, data: unknown) => {
  writeFileSync(`${outDir}${name}.json`, JSON.stringify(data, null, 2) + '\n');
  console.log(`  ✓ ${name}.json`);
};

// Technologies carry a derived usedInMissions index — computed here exactly as
// the API's /export does (mission order preserved), so the frontend just reads.
const technologiesWithUsage = technologies.map((t) => ({
  ...t,
  usedInMissions: missions.filter((m) => m.technologies.includes(t.id)).map((m) => m.id),
}));

// Archive: split meta (eager chunk) from full records (lazy chunk).
const archiveManifest = archiveRecords.map(({ body, refs, ...meta }) => meta);

console.log('Exporting content → src/content/_generated/');
write('pilot', pilot);
write('missions', missions);
write('technologies', technologiesWithUsage);
write('experience', experience);
write('training', trainingSims);
write('frequencies', frequencies);
write('archive-sections', archiveSections);
write('archive-manifest', archiveManifest);
write('archive-records', archiveRecords);
write('site-copy', {});
console.log('Done.');
