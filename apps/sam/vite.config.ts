import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = dirname(fileURLToPath(import.meta.url));

// Monorepo: Syn is the root package of this repository. The app imports its source directly,
// so a change in Syn shows up here at once, with no build step in between.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@syn/design-system': resolve(here, '../../src/index.ts') },
    dedupe: ['react', 'react-dom'],
  },
  server: { fs: { allow: [resolve(here, '../..')] } },
});
