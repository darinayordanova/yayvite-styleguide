// Compiles each CSS entry separately so apps import only the layers they use,
// minifies with Lightning CSS, and copies fonts + SCSS tokens into dist.
import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { browserslistToTargets, transform } from 'lightningcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const entries = ['tokens', 'utilities', 'icons', 'components', 'scrollbars', 'fonts', 'yayvite'];

// Browsers with :has(), color-mix() and variable woff2 support.
const targets = browserslistToTargets([
  'chrome >= 111',
  'edge >= 111',
  'firefox >= 121',
  'safari >= 16.4',
]);

await mkdir(path.join(dist, 'css'), { recursive: true });

for (const entry of entries) {
  const { css } = sass.compile(path.join(root, 'src/css', `${entry}.scss`));
  const { code } = transform({
    filename: `${entry}.css`,
    code: Buffer.from(css),
    minify: true,
    targets,
  });
  await writeFile(path.join(dist, 'css', `${entry}.css`), code);
}

await mkdir(path.join(dist, 'fonts'), { recursive: true });
for (const file of await readdir(path.join(root, 'src/fonts'))) {
  if (file.endsWith('.woff2')) {
    await cp(path.join(root, 'src/fonts', file), path.join(dist, 'fonts', file));
  }
}

await cp(path.join(root, 'src/styles/tokens'), path.join(dist, 'scss/tokens'), { recursive: true });
await cp(path.join(root, 'src/styles/_functions.scss'), path.join(dist, 'scss/_functions.scss'));

console.log(`Built ${entries.length} CSS files.`);
