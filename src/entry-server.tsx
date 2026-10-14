import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import {
  StaticRouterProvider,
  createStaticHandler,
  createStaticRouter,
  matchRoutes,
} from 'react-router-dom';
import { App } from './App';
import { routes, type RouteHandle } from './app/router/routes';
import { ROUTES } from './app/router/paths';
import { missions } from './content/missions';
import { archiveManifest } from './content/archive/manifest';
import { SITE } from './lib/seo/seo.config';

export { SITE };

/** Every public URL that gets its own prerendered HTML (and a sitemap entry):
    the seven decks plus each mission and archive record in the content bundle. */
export function prerenderPaths(): string[] {
  return [
    ROUTES.bridge,
    ROUTES.pilot,
    ROUTES.systems,
    ROUTES.missions,
    ROUTES.logbook,
    ROUTES.comms,
    ROUTES.archive,
    ...missions.map((m) => ROUTES.missionDetail(m.id)),
    ...archiveManifest.map((r) => ROUTES.archiveRecord(r.id)),
  ];
}

/**
 * Build-time render of one route to static HTML (consumed by
 * scripts/prerender.ts, never shipped to the browser).
 */
export async function render(path: string): Promise<string> {
  // Resolve the route's lazy pages up front: a page that suspends would be
  // outlined into a hidden segment revealed by an inline script, instead of
  // sitting in place in the HTML.
  const matches = matchRoutes(routes, path) ?? [];
  await Promise.all(
    matches.map((m) => (m.route.handle as RouteHandle | undefined)?.preload?.()),
  );

  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`${SITE.url}${path}`));
  if (context instanceof Response) throw new Error(`Unexpected redirect for ${path}`);

  const router = createStaticRouter(handler.dataRoutes, context);
  const { prelude } = await prerender(
    <StrictMode>
      <App>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </App>
    </StrictMode>,
    // Never outline large boundaries into script-revealed segments: a static
    // page has nothing to stream, and crawlers should find content in place.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );
  return new Response(prelude).text();
}
