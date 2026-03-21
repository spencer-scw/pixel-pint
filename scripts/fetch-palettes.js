import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const PALETTES_LIST = JSON.parse(readFileSync('public/lospec-palettes.json', 'utf-8'));
const OUT_DIR = 'public/palettes';
const TIMEOUT_MS = 10000;

function parseHexFile(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith(';'))
    .map(hex => hex.startsWith('#') ? hex : `#${hex}`);
}

async function fetchPalette(name) {
  const url = `https://lospec.com/palette-list/${name}.hex`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return parseHexFile(text);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Fetching ${PALETTES_LIST.length} palettes from Lospec...`);

  const entries = await Promise.all(
    PALETTES_LIST.map(async (name) => {
      try {
        const colors = await fetchPalette(name);
        console.log(`  ${name}: ${colors.length} colors`);
        return [name, colors];
      } catch (err) {
        console.error(`  ${name}: FAILED - ${err.message}`);
        return null;
      }
    })
  );

  const results = Object.fromEntries(entries.filter(Boolean));
  writeFileSync(`${OUT_DIR}/bundled.json`, JSON.stringify(results, null, 2));

  const failed = PALETTES_LIST.length - Object.keys(results).length;
  console.log(`\nBundled ${Object.keys(results).length} palettes` + (failed ? ` (${failed} failed)` : ''));
}

main();
