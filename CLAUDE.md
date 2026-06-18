# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"BG-01 Space Station" — Brayan Gómez's portfolio as an immersive space-station SPA. React 19 + TypeScript + Vite (rolldown), React Router 7, `motion` (import from `motion/react`, never `framer-motion`). No backend; deployed to GitHub Pages (https://brayangomez22.github.io/) via `.github/workflows/deploy.yml` on push to `main`.

All user-facing copy is in **Spanish**, written in the station fiction (decks, misiones, bitácora). Each diegetic term carries a plain `hint` translation (see `src/app/router/decks.ts`) so recruiters never need to decode the fiction — preserve both layers when editing copy.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (typecheck + build; this is the main verification command)
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run preview` — serve the production build

There are no tests. The `lint` script exists in package.json but ESLint is not installed; don't rely on it. Prettier config: single quotes, semicolons, trailing commas, print width 90.

## Architecture

Route = "deck". `src/app/router/decks.ts` is the single source of truth mapping routes to decks (index, code, name, hint); the HUD stamp, NavDock, and directional route transitions all derive from it — never duplicate route→deck logic. Route strings live only in `src/app/router/paths.ts` (`ROUTES` for navigation, `ROUTE_PATTERNS` for router definitions); never inline a route string.

Composition: `main.tsx` → `App` → `AppProviders` (Motion → Sound → Boot contexts) → `RouterProvider`. All routes are children of `StationShell` (`src/app/layout/StationShell.tsx`), which owns the persistent chrome: background FX layers, `HudFrame`, `NavDock`, `CommandConsole` (Ctrl/Cmd+K palette), `StationMap`, `CustomCursor`, the first-session `BootSequence` overlay, and the directional `RouteTransition` driven by deck travel direction.

Layers under `src/`:

- `features/<deck>/` — one folder per route: `<Name>Page.tsx` plus feature-local `components/` and `hooks/`. Pages are lazy-loaded, one chunk per feature, via `paced()` in `routes.tsx` (artificial hold so the telemetry loader can be read; skipped on first load and for reduced motion). Pages use **default exports** (required by `React.lazy` — the documented exception to the named-export rule used everywhere else).
- `components/` — shared, grouped by role: `ui/` (primitives), `hud/`, `fx/`, `boot/`, `console/`, `map/`, `feedback/`.
- `content/` — all portfolio data (pilot, missions, experience, technologies, socials, archive posts) as typed TS constants; edit content here, not in components.
- `lib/` — framework-free utilities: audio engine (Web Audio, no audio files), motion variants/transitions, SEO (React 19 native document metadata via `lib/seo/Seo.tsx` + per-route copy in `seo.config.ts`), visitor manifest (localStorage only — no cookies, no tracking), `pulse.ts` (anonymous, cookieless visit beacon to the `bg01-api` `/pulse` endpoint — the one external call, fired once per session for the control center's traffic counter).
- `styles/tokens/` — design tokens as CSS custom properties, imported once through `styles/index.css`.

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
- GitHub Pages SPA fallback: the deploy workflow copies `index.html` to `404.html` so deep links work — keep that step if you touch the workflow.
