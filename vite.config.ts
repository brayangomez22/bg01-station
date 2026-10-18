import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
// `isSsrBuild` is the prerender bundle (entry-server.tsx → dist-ssr/), run once
// by scripts/prerender.ts at build time; it never needs public/ assets.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  publicDir: isSsrBuild ? false : 'public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    modules: {
      // BEM class names are authored in kebab/double-underscore form and
      // accessed via bracket notation (styles['block__element']). We keep the
      // original names readable in dev and hashed in prod.
      localsConvention: 'dashes',
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:base64:6]'
          : '[name]__[local]___[hash:base64:4]',
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // Read by scripts/prerender.ts to link each page's own CSS chunk, then deleted.
    manifest: !isSsrBuild,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
            },
            {
              name: 'motion',
              test: /[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/,
            },
          ],
        },
      },
    },
  },
}));
