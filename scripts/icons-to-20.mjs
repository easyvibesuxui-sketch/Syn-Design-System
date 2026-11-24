// Puts SVG icon files on the standard 20 x 20 board: an icon drawn on another board is scaled to fit and
// centred inside a <g>. Files already 20 x 20, and the illustrations, are left as they are.
// Usage: node scripts/icons-to-20.mjs <folder> [<folder> ...]   (npm run icons runs it on icons/svg)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STANDARD = 20;
export const ILLUSTRATIONS = ['empty-list', 'search-empty'];
const round = (v) => Math.round(v * 1000) / 1000;

export function fit20(width, height) {
  const scale = Math.min(STANDARD / width, STANDARD / height);
  return { scale: round(scale), x: round((STANDARD - width * scale) / 2), y: round((STANDARD - height * scale) / 2) };
}

export function toStandard(svg) {
  const m = svg.match(/^(\s*<svg\b)([^>]*)>([\s\S]*)<\/svg>\s*$/);
  if (!m) throw new Error('not an <svg> file');
  const [, open, attrs, inner] = m;
  const box = attrs.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!box) throw new Error('no viewBox');
  const width = Number(box[1]);
  const height = Number(box[2]);
  if (width === STANDARD && height === STANDARD) return svg;
  const t = fit20(width, height);
  const transform = t.scale === 1 ? `translate(${t.x} ${t.y})` : `translate(${t.x} ${t.y}) scale(${t.scale})`;
  const head = attrs
    .replace(/\bwidth="[\d.]+"/, `width="${STANDARD}"`)
    .replace(/\bheight="[\d.]+"/, `height="${STANDARD}"`)
    .replace(/viewBox="0 0 [\d.]+ [\d.]+"/, `viewBox="0 0 ${STANDARD} ${STANDARD}"`);
  return `${open}${head}><g transform="${transform}">${inner}</g></svg>`;
}

export function standardizeFolder(dir) {
  const changed = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.svg')).sort()) {
    if (ILLUSTRATIONS.includes(f.slice(0, -4))) continue;
    const path = join(dir, f);
    const svg = readFileSync(path, 'utf8');
    const out = toStandard(svg);
    if (out !== svg) {
      writeFileSync(path, out);
      changed.push(f);
    }
  }
  return changed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) throw new Error('usage: node scripts/icons-to-20.mjs <folder> [<folder> ...]');
  for (const d of dirs) {
    const changed = standardizeFolder(d);
    console.log(`${d}: ${changed.length} put on 20 x 20${changed.length ? ' (' + changed.join(', ') + ')' : ''}`);
  }
}
