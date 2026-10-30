import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = dirname(fileURLToPath(import.meta.url));

// `vite` serves the playground; `vite build` builds the library;
// `vite build --mode docs` builds the playground as a static site.
export default defineConfig(({ command, mode }) => {
  if (command === 'serve' || mode === 'docs') {
    return {
      plugins: [react()],
      root: 'playground',
      base: './',
      build: {
        outDir: resolve(root, 'docs-site'),
        emptyOutDir: true,
        // The style guide and the Syniotec Shop example built from Syn components.
        rollupOptions: { input: { main: resolve(root, 'playground/index.html'), shop: resolve(root, 'playground/shop/index.html') } },
      },
    };
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
