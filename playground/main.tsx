import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Imported directly: the build tree-shakes the src/index.ts barrel, and its CSS imports with it.
import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './playground.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
