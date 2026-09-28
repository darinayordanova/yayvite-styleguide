// Copies the self-hosted variable fonts (latin subset only) out of
// @fontsource-variable so fonts.css can reference them by relative URL.
// Consumers who load the fonts some other way simply skip fonts.css.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src/fonts');

const files = [
  '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
];

await mkdir(outDir, { recursive: true });
for (const file of files) {
  await copyFile(path.join(root, 'node_modules', file), path.join(outDir, path.basename(file)));
}
console.log(`Copied ${files.length} font files.`);
