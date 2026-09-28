# yayvite-styleguide

Yayvite design system & component library: design tokens, utility classes, an icon font and React components.

## Install

```sh
npm install @yayvite/styleguide
```

Requires React 18 or newer.

## Styles

Import everything at once:

```ts
import '@yayvite/styleguide/fonts.css'; // optional: self-hosted Playfair Display + DM Sans
import '@yayvite/styleguide/styles.css'; // tokens, icons, components, utilities
```

Or import only the layers you use:

| File | Contents | Size (gzip) |
| --- | --- | --- |
| `tokens.css` | CSS custom properties (`*`). Needed by everything else. | ~0.6 KB |
| `icons.css` | Icon font + `.icon-*` classes | ~0.5 KB + 5.7 KB font |
| `components.css` | Styles for the React components (needs `icons.css`) | ~1.5 KB |
| `utilities.css` | Color, spacing and typography classes | ~2 KB |
| `fonts.css` | Variable woff2 fonts, latin subset | ~0.3 KB + ~75 KB fonts |

Skip `fonts.css` if your app already loads Playfair Display and DM Sans.

### Tokens

All values are CSS custom properties, so an app can re-theme by overriding them:

```css
:root {
  color-evergreen-700: #3e5e50;
}
```

- Colors: `color-{evergreen|rose|neutral}-{100|300|500|700|900}`, `color-white`,
  `color-{success|warning|error|info}` and their `-light` variants.
- Spacing (4px steps): `space-{0|1|2|3|4|5|6|8|10|12|16|20|24}`, e.g. `space-4` = 16px.
- Type: `font-serif`, `font-sans`, `font-weight-{regular|medium|semibold|bold}`,
  `text-{style}-size`, `text-{style}-line-height`.
- Radius: `radius-{sm|md|lg|full}`.

The same tokens are published as SCSS maps under `@yayvite/styleguide/scss/tokens`.

### Utility classes

```html
<p class="text-body text-neutral-700 mb-4">…</p>
<h1 class="text-display text-neutral-900">Your love, beautifully told</h1>
```

- Color: `.text-{color}`, `.bg-{color}`, `.border-{color}`
- Spacing: `.{m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py|gap|gap-x|gap-y}-{step}`, `.m-auto`, `.mx-auto`
- Typography: `.text-{display|h1|h2|h3|body-lg|body|body-sm|label}`, `.font-{serif|sans}`,
  `.font-{regular|medium|semibold|bold}`

## Icons

```tsx
import { Icon } from '@yayvite/styleguide';

<Icon name="heart" size={24} />;
```

Or in plain HTML: `<i class="icon icon-heart" aria-hidden="true"></i>`. Icons inherit `color`
and default to 20px.

To add an icon, drop a 20×20 SVG into `src/icons/svg/` and run `npm run icons`. Existing icons keep
their codepoints (`src/icons/codepoints.json`).

## Components

```tsx
import { Button, IconButton, TextInput, Checkbox, Radio, Toggle } from '@yayvite/styleguide';

<Button variant="primary" size="md" iconEnd="arrow">Continue</Button>
<IconButton icon="heart" aria-label="Like" />
<TextInput label="Email" iconStart="mail" error="Enter a valid email address" />
<Checkbox label="Include RSVP card" defaultChecked />
<Radio name="format" value="digital" label="Digital invitations" />
<Toggle label="Guest notifications" description="Send updates by email" />
```

All components forward refs and accept their native element's props.

## Development

```sh
npm install
npm run storybook   # component docs on http://localhost:6006
npm run build       # icons, fonts, JS + types, CSS → dist/
```
