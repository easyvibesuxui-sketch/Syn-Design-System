import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = dirname(fileURLToPath(import.meta.url));

// `vite` serves the playground; `vite build` builds the library;
// `vite build --mode docs` builds the playground as a static site.
export default defineConfig(({ command, mode }) => {
  if (command === 'serve' || mode === 'docs') {
    return { plugins: [react()], root: 'playground', base: './', build: { outDir: resolve(root, 'docs-site'), emptyOutDir: true } };
  }
  return {
    plugins: [react()],
    build: {
      lib: { entry: resolve(root, 'src/index.ts'), formats: ['es'], fileName: () => 'syn.js', cssFileName: 'syn' },
      rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'], output: { assetFileNames: 'syn.[ext]' } },
      emptyOutDir: false,
    },
  };
});
