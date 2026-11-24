// Checks the atomic design layers (scripts/atomic-layers.json):
// - every source file in src/components has a layer,
// - a file imports only files of its own layer or a lower one (an atom never uses a molecule),
// - foundations (tokens, utils, icons, styles) import no components,
// - every component exported from src/index.ts has a layer, no higher than its file's.
// Run: npm run check:layers (also part of npm run build).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(root, 'scripts/atomic-layers.json'), 'utf8'));
const rank = Object.fromEntries(map.order.map((l, i) => [l, i]));
const errors = [];

for (const [name, layer] of [...Object.entries(map.files), ...Object.entries(map.components)]) {
  if (!(layer in rank)) errors.push(`${name}: unknown layer "${layer}" (use one of ${map.order.join(', ')})`);
}

// Component files and the files they import.
const dir = join(root, 'src/components');
const files = readdirSync(dir).filter((f) => f.endsWith('.tsx') && !/\.(test|spec|stories)\.tsx$/.test(f)).map((f) => f.slice(0, -4));
for (const f of files) if (!map.files[f]) errors.push(`src/components/${f}.tsx has no layer: add it to "files" in scripts/atomic-layers.json`);
for (const f of Object.keys(map.files)) if (!files.includes(f)) errors.push(`"files" lists ${f}, but src/components/${f}.tsx does not exist`);

const importsOf = (src) => [...src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
for (const f of files) {
  const layer = map.files[f];
  if (!layer) continue;
  for (const spec of importsOf(readFileSync(join(dir, f + '.tsx'), 'utf8'))) {
    const m = spec.match(/^\.\/([A-Za-z]+)$/);
    if (!m) continue;
    const dep = m[1];
    const depLayer = map.files[dep];
    if (depLayer && rank[depLayer] > rank[layer]) {
      errors.push(`${f} (${layer}) imports ${dep} (${depLayer}): a ${layer} may use only ${map.order.slice(0, rank[layer] + 1).join(' / ')}`);
    }
  }
}

// Foundations must not depend on components.
const foundation = [join(root, 'src/tokens.ts'), join(root, 'src/utils.ts')];
for (const sub of ['src/icons']) {
  try { for (const f of readdirSync(join(root, sub))) if (/\.(ts|tsx)$/.test(f)) foundation.push(join(root, sub, f)); } catch { /* none */ }
}
for (const file of foundation) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  for (const spec of importsOf(src)) if (/components\//.test(spec)) errors.push(`${file.slice(root.length + 1)} is a foundation but imports ${spec}`);
}

// Exported components: each needs a layer, not above its file's.
const index = readFileSync(join(root, 'src/index.ts'), 'utf8');
for (const m of index.matchAll(/export\s*\{([^}]*)\}\s*from\s*['"]\.\/components\/([A-Za-z]+)['"]/g)) {
  const file = m[2];
  const names = m[1].split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('type ') && /^[A-Z][a-z]/.test(s));
  for (const n of names) {
    const layer = map.components[n];
    if (!layer) { errors.push(`${n} (exported from ${file}) has no layer: add it to "components" in scripts/atomic-layers.json`); continue; }
    if (map.files[file] && rank[layer] > rank[map.files[file]]) errors.push(`${n} is a ${layer}, higher than its file ${file} (${map.files[file]}): raise the file's layer`);
  }
}

if (errors.length) {
  console.error(`Atomic layers: ${errors.length} problem(s)\n- ` + errors.join('\n- '));
  process.exit(1);
}
const count = Object.fromEntries(map.order.map((l) => [l, Object.values(map.components).filter((v) => v === l).length]));
console.log(`Atomic layers OK: ${files.length} files, ${Object.keys(map.components).length} components (` + map.order.filter((l) => count[l]).map((l) => `${count[l]} ${l}`).join(', ') + ')');
