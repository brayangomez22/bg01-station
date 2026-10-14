# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"BG-01 Space Station" — Brayan Gómez's portfolio as an immersive space-station SPA. React 19 + TypeScript + Vite (rolldown), React Router 7, `motion` (import from `motion/react`, never `framer-motion`). Static SPA deployed to GitHub Pages at https://brayangomez.dev (repo `brayangomez22/bg01-station`) via `.github/workflows/deploy.yml`. Content is managed by a separate Go CMS, **bg01-api** (repo `brayangomez22/bg01-api`, on Fly.io at https://api.brayangomez.dev) — see "Content pipeline" below.

All user-facing copy is in **Spanish**, written in the station fiction (decks, misiones, bitácora). Each diegetic term carries a plain `hint` translation (see `src/app/router/decks.ts`) so recruiters never need to decode the fiction — preserve both layers when editing copy.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — typecheck, client build, SSR build of `src/entry-server.tsx` into `dist-ssr/`, then `scripts/prerender.ts` (see "Prerender"). This is the main verification command.
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run preview` — serve the production build
- `npm run lint` — ESLint (flat config in `eslint.config.js`: typescript-eslint recommended + react-hooks, including the React Compiler rules — `set-state-in-effect`, `refs`, `immutability`… — as errors; `exhaustive-deps` is a warning). `react/no-danger` is a small local rule (eslint-plugin-react doesn't support ESLint 10 yet). Lint is clean; keep it that way.
- `npm run sync:content` — pull the latest content from the API's `/export` into `src/content/_generated/` (`API_BASE` env, defaults to `http://localhost:8080`)
- `npm run seed` — one-shot bootstrap: push `_generated/*.json` into an empty API via admin endpoints (`API_BASE`, `SEED_PASSWORD`). Not part of normal work.

There are no tests. Prettier config: single quotes, semicolons, trailing commas, print width 90.

## Architecture

Route = "deck". `src/app/router/decks.ts` is the single source of truth mapping routes to decks (index, code, name, hint); the HUD stamp, NavDock, and directional route transitions all derive from it — never duplicate route→deck logic. Route strings live only in `src/app/router/paths.ts` (`ROUTES` / `CONTROL` for navigation, `ROUTE_PATTERNS` / `CONTROL_PATTERNS` for router definitions); never inline a route string. Hover prefetch (`prefetch.ts`) resolves any path through the route table and each deck page's `handle.prefetch` — no separate route→chunk map.

Composition: `main.tsx` → `App` → `AppProviders` (Motion → Sound → Boot contexts) → `RouterProvider` (`StaticRouterProvider` in `entry-server.tsx`). `routes.tsx` exports the route table (`routes`), never a router instance — the browser router is created in `main.tsx`. All public (deck) routes are children of `StationShell` (`src/app/layout/StationShell.tsx`), which owns the persistent chrome: background FX layers, `HudFrame`, `NavDock`, `CommandConsole` (Ctrl/Cmd+K palette), `StationMap`, `CustomCursor`, the first-session `BootSequence` overlay, and the directional `RouteTransition` driven by deck travel direction.

Layers under `src/`:

- `features/<deck>/` — one folder per route: `<Name>Page.tsx` plus feature-local `components/` and `hooks/`. Pages are lazy-loaded, one chunk per feature, via `paced()` in `routes.tsx` (artificial hold so the telemetry loader can be read; skipped on first load and for reduced motion). Pages use **default exports** (required by `React.lazy` — the documented exception to the named-export rule used everywhere else).
- `components/` — shared, grouped by role: `ui/` (primitives), `hud/`, `fx/`, `boot/`, `console/`, `map/`, `feedback/`.
- `content/` — typed accessors over the content bundle: each module imports its JSON from `content/_generated/` and casts it to the domain types in `src/types/domain`. Components read content only through these modules. See "Content pipeline".
- `features/control/` — the Centro de Control (`/control`), an authenticated admin area for editing content in bg01-api. It is a sibling router branch with its own `ControlShell`, **not a deck** (routes in `CONTROL` in `paths.ts`, outside `decks.ts`); public station chrome never applies there. Its API client lives in `lib/control/` and uses `VITE_API_BASE_URL`.
- `lib/` — framework-free utilities: audio engine (Web Audio, no audio files), motion variants/transitions, SEO (React 19 native document metadata via `lib/seo/Seo.tsx` + per-route copy in `seo.config.ts`), visitor manifest (localStorage only — no cookies, no tracking), `pulse.ts` (anonymous, cookieless visit beacon to the `bg01-api` `/pulse` endpoint — the one external call, fired once per session for the control center's traffic counter).
- `styles/tokens/` — design tokens as CSS custom properties, imported once through `styles/index.css`.

## Content pipeline

The source of truth for portfolio content (pilot, missions, technologies, experience, training, frequencies, archive, site copy) is the **bg01-api database** (SQLite on a Fly.io volume, replicated to R2 with Litestream), not this repo.

1. Edit content in the Centro de Control (`/control`), which talks to the API (`VITE_API_BASE_URL`, baked in at build time).
2. "Publicar estación" in the control overview calls `POST /admin/publish` (`lib/control/publish.ts`); the API fires a GitHub `repository_dispatch` (`content-updated`) at this repo.
3. `deploy.yml` (also triggered on push to `main` and manually) runs `npm run sync:content`, which fetches `/export` and rewrites `src/content/_generated/*.json`, then builds and deploys to Pages.
4. The sync is best-effort: if the API is unreachable it warns and exits 0, and the build uses the JSON snapshot committed in the repo.

**Never edit `src/content/_generated/` by hand.** The next publish or deploy overwrites it with whatever is in the database. Change content in `/control` (or the API) instead; to refresh the committed snapshot locally, run `API_BASE=https://api.brayangomez.dev npm run sync:content` and commit the result. If a content *shape* changes, update the API's `/export`, the domain types, and the `content/` accessors together. `scripts/export-content.ts` is a historical one-shot bootstrap (it imports the `content/` modules, which now read the JSON themselves) — don't use it to author content.

## Prerender

GitHub Pages has no server, so the build writes one static HTML file per public URL and the client hydrates it:

- `src/entry-server.tsx` renders a path with `react-dom/static` `prerender` + `StaticRouterProvider`, and exports `prerenderPaths()`: the seven decks plus every `/missions/:id` and `/archive/:id` from the content bundle. New public routes must be added there.
- `scripts/prerender.ts` runs that bundle and writes `dist/<route>.html` (`/` → `index.html`, `/pilot` → `pilot.html`, `/missions/x` → `missions/x.html`). Use `.html` files, not `<route>/index.html`: Pages serves `/pilot` from `pilot.html` with a 200, while a directory would 301 to `/pilot/` and contradict the canonicals. Each route's `<Seo>` tags are moved into `<head>`, replacing the generic ones in `index.html`. It also writes `sitemap.xml` (don't add one to `public/`) and `404.html`: the "señal perdida" page, served by Pages with a 404 for unknown paths and for `/control/*`.
- `#root` carries `data-prerendered="<path>"`. `main.tsx` hydrates only when it matches the URL, after awaiting the route's `handle.preload` (set by `deckPage()` in `routes.tsx`, which then makes `React.lazy` resolve synchronously so the page hydrates in place). Otherwise (404.html fallback) it client-renders from scratch.
- The boot overlay is always in the prerendered HTML; the inline script in `index.html` sets `html[data-docked]` before paint for sessions that already docked, and `global.css` hides it. `BootProvider` then drops it in a layout effect.

## Creative Direction

### Identity

BG-01 is not simply a portfolio. It is a futuristic space station operated by a software engineer. Every page represents a real module of the station, and new features must feel like real station systems — not UI bolted onto a theme.

### Inspiration — and what it is not

Draw from: Interstellar, The Expanse, NASA Mission Control, aerospace control centers, technical instrumentation, advanced engineering.

It is **not**: cyberpunk, neonpunk, hacker-terminal cliché, a videogame, or cartoonish sci-fi. If a change pulls toward any of those, it's wrong even if it looks cool.

### Visual philosophy

Elegant, professional, technological, minimalist, credible, immersive — in that spirit. Restraint over spectacle.

### Principles

- Every improvement must reinforce the feeling of a living space station.
- The narrative must never hurt usability.
- A recruiter must understand who Brayan is and what he does in under 10 seconds.

### Storytelling — current modules

```
00 · Puente                    (home)
01 · Piloto                    (about)
02 · Sistemas                  (technologies)
03 · Misiones                  (projects)
04 · Bitácora                  (experience)
05 · Comunicaciones            (contact)
06 · Archivo de Conocimiento   (tech blog)
```

This list must stay in sync with `src/app/router/decks.ts`.

### Performance

- SVG before heavy images.
- Prioritize performance; avoid unnecessary decorative effects.
- Keep Lighthouse scores high.

## Conventions

- CSS Modules with BEM-style class names accessed via bracket notation: `styles['station-shell__content']`, `styles['panel--bracketed']` (vite.config.ts `localsConvention: 'dashes'` supports this). Co-locate `X.module.css` with `X.tsx`.
- Path alias `@/` → `src/`.
- Accessibility is load-bearing, not decorative: sound is off by default, `MotionConfig reducedMotion="user"` applies globally, decorative FX layers are `aria-hidden`, and reduced-motion visitors are never held on decorative loaders. Don't regress these when adding effects.
- localStorage/sessionStorage keys are namespaced `bg01:*` and every access tolerates storage being unavailable (degrade, never throw).
- The comms form (`useTransmission`) delivers via Web3Forms (`src/lib/comms/web3forms.ts`); the access key comes from `VITE_WEB3FORMS_ACCESS_KEY` (see `.env.example`) and is public by design.
- Prerender-safe rendering (see "Prerender"): no `window`/`document`/storage access at module scope or during render; anything that differs between the build and the visitor's browser (clock, storage, media queries, random) must render the same as the prerender first — use `useHydrated()` (`src/hooks/useHydrated.ts`) or `useSyncExternalStore` with a server snapshot, never a `useState` initializer that reads the browser.
- Keep the `repository_dispatch: content-updated` trigger and the `sync:content` step before the build in `deploy.yml`; publishing from `/control` depends on both.
