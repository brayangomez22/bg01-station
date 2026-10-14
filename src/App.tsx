import type { ReactNode } from 'react';
import { AppProviders } from '@/app/providers/AppProviders';

/**
 * Application root. The router provider is injected by the entry point:
 * `RouterProvider` in the browser (main.tsx), `StaticRouterProvider` in the
 * build-time prerender (entry-server.tsx).
 */
export function App({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
