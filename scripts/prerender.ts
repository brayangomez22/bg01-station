/**
 * Build-time prerender (run with tsx after both Vite builds; see `npm run build`).
 *
 * Renders every public route through the SSR bundle (dist-ssr/entry-server.js)
 * into the client build's index.html, so GitHub Pages answers each URL with
 * 200 and real content + per-route metadata in the initial HTML:
 *
 *   /            → dist/index.html
 *   /pilot       → dist/pilot.html           (Pages serves it at /pilot, no redirect)
 *   /missions/x  → dist/missions/x.html
 *
 * Also writes dist/sitemap.xml with the same URLs, and dist/404.html: the
 * "señal perdida" page for unknown paths, which doubles as the SPA fallback
 * for /control (main.tsx client-renders whenever the prerendered path doesn't
 * match the URL).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface ServerEntry {
  render(path: string): Promise<string>;
  prerenderPaths(): string[];
  SITE: { url: string };
}

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = `${root}dist/`;
const ssrDir = `${root}dist-ssr/`;

/** Path that matches no route, rendered into 404.html. */
const NOT_FOUND_PATH = '/404';

/** Generic tags in index.html that every route renders itself via <Seo>. */
const ROUTE_META =
  /<title>[\s\S]*?<\/title>\s*|<meta\s+(?:name|property)="(?:description|og:title|og:description|og:url|twitter:title|twitter:description)"[\s\S]*?\/>\s*/g;

/** React emits hoisted <title>/<meta>/<link> ahead of the app markup. */
const HOISTED = /^(?:<title>[\s\S]*?<\/title>|<meta\b[^>]*\/>|<link\b[^>]*\/>)*/;

const fileFor = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main(): Promise<void> {
  const entry = (await import(
    pathToFileURL(`${ssrDir}entry-server.js`).href
  )) as ServerEntry;
  const template = readFileSync(`${dist}index.html`, 'utf8').replace(ROUTE_META, '');
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      'prerender: empty #root not found in dist/index.html (already prerendered? run the full `npm run build`)',
    );
  }

  const page = async (path: string, stamp: boolean): Promise<string> => {
    const html = await entry.render(path);
    const hoisted = HOISTED.exec(html)?.[0] ?? '';
    const body = html.slice(hoisted.length);
    const attr = stamp ? ` data-prerendered="${path}"` : '';
    // Unstamped pages (404.html) get client-rendered for whatever URL they
    // serve; main.tsx drops their marked head tags so the real route's own
    // <title>/<meta> don't stack on top of "señal perdida".
    const head = stamp
      ? hoisted
      : hoisted.replace(/<(title|meta|link)\b/g, '<$1 data-fallback-head');
    return template
      .replace('</head>', `  ${head}\n  </head>`)
      .replace('<div id="root"></div>', () => `<div id="root"${attr}>${body}</div>`);
  };

  const write = (file: string, html: string) => {
    mkdirSync(dirname(`${dist}${file}`), { recursive: true });
    writeFileSync(`${dist}${file}`, html);
    console.log(`  ✓ ${file}`);
  };

  const paths = entry.prerenderPaths();
  console.log(`Prerendering ${paths.length} routes`);
  for (const path of paths) write(fileFor(path), await page(path, true));
  write('404.html', await page(NOT_FOUND_PATH, false));

  const urls = paths
    .map(
      (p) =>
        `  <url><loc>${escapeXml(`${entry.SITE.url}${p === '/' ? '/' : p}`)}</loc></url>`,
    )
    .join('\n');
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );

  rmSync(ssrDir, { recursive: true, force: true });
}

await main();
