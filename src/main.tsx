import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, matchRoutes } from 'react-router-dom';
import { App } from './App';
import { routes, type RouteHandle } from './app/router/routes';
import { sendPulse } from './lib/pulse';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

const router = createBrowserRouter(routes);
const app = (
  <StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </StrictMode>
);

/** Path the HTML was prerendered for (scripts/prerender.ts stamps it on #root). */
const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
const prerendered = container.dataset.prerendered;

if (prerendered && prerendered === normalize(window.location.pathname)) {
  // Fetch the route's lazy page chunks first so hydration resolves them in a
  // microtask instead of tearing down the prerendered markup.
  const matches = matchRoutes(routes, window.location) ?? [];
  await Promise.all(
    matches.map((m) => (m.route.handle as RouteHandle | undefined)?.preload?.()),
  );
  hydrateRoot(container, app);
} else {
  // SPA fallback (404.html serving /control, unknown paths…): the markup in
  // #root belongs to another route, so render from scratch.
  container.replaceChildren();
  document.head.querySelectorAll('[data-fallback-head]').forEach((tag) => tag.remove());
  createRoot(container).render(app);
}

// Register this visit with the station (anonymous, once per session).
sendPulse();
