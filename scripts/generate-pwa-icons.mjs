// Генератор PWA-иконок из бренд-градиента.
// Запуск: node scripts/generate-pwa-icons.mjs
// Требует rsvg-convert (librsvg) в PATH. Перегенерировать при ребрендинге.
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons');

// Бренд-градиент из globals.css: linear-gradient(135deg,#f97316,#ef4444,#ec4899)
const GRADIENT = `
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%"  stop-color="#f97316"/>
    <stop offset="50%" stop-color="#ef4444"/>
    <stop offset="100%" stop-color="#ec4899"/>
  </linearGradient>`;

// Глиф "utensils" из lucide-react (проект уже использует lucide) — белый штрих.
const GLYPH = `
  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
  <path d="M7 2v20"/>
  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`;

// scale = доля канвы, занимаемая глифом (центрирован вокруг 12,12 в viewBox 24).
function svg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>${GRADIENT}</defs>
  <rect width="24" height="24" fill="url(#g)"/>
  <g transform="translate(12 12) scale(${scale}) translate(-12 -12)"
     fill="none" stroke="#ffffff" stroke-width="1.5"
     stroke-linecap="round" stroke-linejoin="round">${GLYPH}</g>
</svg>`;
}

const TARGETS = [
  // обычные иконки — глиф крупный, фон full-bleed
  { file: 'icon-192.png', size: 192, scale: 0.8 },
  { file: 'icon-512.png', size: 512, scale: 0.8 },
  { file: 'apple-touch-icon.png', size: 180, scale: 0.8 },
  // maskable — глиф в safe-зоне (~центральные 60%), фон full-bleed
  { file: 'icon-512-maskable.png', size: 512, scale: 0.58 },
];

await mkdir(OUT_DIR, { recursive: true });
for (const { file, size, scale } of TARGETS) {
  const tmp = join(OUT_DIR, `.${file}.svg`);
  await writeFile(tmp, svg(scale));
  execFileSync('rsvg-convert', [
    '-w', String(size), '-h', String(size),
    tmp, '-o', join(OUT_DIR, file),
  ]);
  await rm(tmp);
  console.log(`✓ ${file} (${size}x${size})`);
}
console.log(`PWA-иконки записаны в ${OUT_DIR}`);
