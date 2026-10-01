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
import '@yayvite/styleguide/styles.css'; // tokens, icons, components, scrollbars, utilities
```

Or import only the layers you use:

| File | Contents | Size (gzip) |
| --- | --- | --- |
| `tokens.css` | CSS custom properties (`*`). Needed by everything else. | ~0.6 KB |
| `icons.css` | Icon font + `.icon-*` classes | ~0.5 KB + 5.7 KB font |
| `components.css` | Styles for the React components (needs `icons.css`) | ~3 KB |
| `scrollbars.css` | macOS-style scrollbars for the whole page (needs `tokens.css`) | ~0.3 KB |
| `utilities.css` | Layout, grid, flex, color, spacing and typography classes | ~11 KB |
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

The same tokens are published as SCSS maps under `@yayvite/styleguide/scss/tokens`, along with the
breakpoints (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px) and a mixin for them:

```scss
@use '@yayvite/styleguide/scss/tokens' as t;

.hero {
  @include t.breakpoint-up(md) { padding-block: 64px; }
}
```

### Scrollbars

`scrollbars.css` (included in `styles.css`) gives every scrollable element a slim, rounded,
macOS-style scrollbar on a transparent track.

For the full macOS behavior, where scrollbars take no space, float over the content and only
appear while scrolling, also call `enableOverlayScrollbars()` once when the app starts:

```ts
import { enableOverlayScrollbars } from '@yayvite/styleguide';

enableOverlayScrollbars(); // returns a function that turns it off again
// In React: useEffect(() => enableOverlayScrollbars(), []);
```

Add `data-scrollbar="none"` to an element that should never show a scrollbar. Re-theme with:

```css
:root {
  --scrollbar-size: 12px; /* track width; the thumb is inset 3px */
  --scrollbar-thumb: rgb(0 0 0 / 0.35);
  --scrollbar-thumb-hover: rgb(0 0 0 / 0.55);
}
```

### Utility classes

```html
<p class="text-body text-neutral-700 mb-4">…</p>
<h1 class="text-display text-neutral-900">Your love, beautifully told</h1>
```

```html
<div class="container py-12">
  <div class="grid grid-cols-1 md-grid-cols-3 gap-6">…</div>
</div>
```

Layout and spacing classes are mobile-first and take a breakpoint prefix:
`md-grid-cols-3` applies from 768px up. Prefixes: `sm-`, `md-`, `lg-`, `xl-`.

- Container: `.container` (full width, side padding, max width = current breakpoint)
- Grid: `.grid`, `.grid-cols-{1–12}`, `.col-span-{1–12|full}`, `.col-start-{1–13}`,
  `.col-end-{1–13}`, `.grid-rows-{1–6}`, `.row-span-{1–6|full}`, `.grid-flow-{row|col|dense|row-dense}`
- Flex: `.flex`, `.inline-flex`, `.flex-{row|col}[-reverse]`, `.flex-{wrap|nowrap}`,
  `.flex-{1|auto|none}`, `.grow[-0]`, `.shrink[-0]`, `.order-{first|last}`
- Alignment: `.items-*`, `.justify-*`, `.justify-items-*`, `.self-*`, `.place-items-center`,
  `.place-content-center`
- Display: `.block`, `.inline-block`, `.inline`, `.contents`, `.hidden`
- Position: `.{static|relative|absolute|fixed|sticky}`, `.inset-0`, `.{top|right|bottom|left}-0`
- Sizing: `.w-{full|auto|screen}`, `.h-{full|auto|screen}`, `.min-w-0`, `.min-h-screen`,
  `.max-w-{xs|sm|md|lg|xl|2xl|3xl|4xl|prose|full|none}`
- Overflow: `.overflow-{hidden|auto|visible}`, `.overflow-{x|y}-auto`
- Text alignment: `.text-{left|center|right}`
- Spacing: `.{m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py|gap|gap-x|gap-y}-{step}`,
  `.space-{x|y}-{step}` (space between children), `.{m|mx|my|mt|mr|mb|ml}-auto`

Not responsive:

- Color: `.text-{color}`, `.bg-{color}`, `.border-{color}`
- Borders: `.border`, `.border-0`, `.rounded-{none|sm|md|lg|full}`
- Typography: `.text-{display|h1|h2|h3|body-lg|body|body-sm|label}`, `.font-{serif|sans}`,
  `.font-{regular|medium|semibold|bold}`, `.truncate`, `.whitespace-nowrap`
- Other: `.sr-only`, `.aspect-{square|video}`, `.object-{cover|contain}`, `.z-{0|10|20|30|40|50}`

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
import {
  Button, IconButton, TextInput, TextArea, ColorInput, Checkbox, Radio, Toggle, SegmentedControl,
  Select, MultiSelect, DatePicker, TimePicker, FileUpload, Badge, Pill, Stepper, Tabs, Modal,
} from '@yayvite/styleguide';

<Button variant="primary" size="md" iconEnd="arrow">Continue</Button>
<IconButton icon="heart" aria-label="Like" />
<TextInput label="Email" iconStart="mail" error="Enter a valid email address" />
<TextInput label="Website" prefix="yayvite.com/" placeholder="mia-and-tom" />
<TextArea label="Message" showCount maxLength={300} autoResize maxRows={8} />
<ColorInput label="Accent" value={color} onChange={setColor} /> {/* "#rrggbb"; accepts any CSS color typed in */}
<Checkbox label="Include RSVP card" defaultChecked />
<Radio name="format" value="digital" label="Digital invitations" />
<Toggle label="Guest notifications" description="Send updates by email" />
<SegmentedControl aria-label="Format" size="md" options={[{ value: 'digital', label: 'Digital' }, { value: 'print', label: 'Print' }]} />
<Select label="Meal" options={[{ value: 'fish', label: 'Sea bass' }]} onChange={setMeal} />
<MultiSelect label="Diet" options={[{ value: 'vegan', label: 'Vegan' }]} value={diets} onChange={setDiets} />
<DatePicker label="Date" value={date} onChange={setDate} min="2027-01-01" /> {/* "YYYY-MM-DD" */}
<TimePicker label="Time" value={time} onChange={setTime} step={15} /> {/* "HH:mm" */}
<FileUpload label="Photos" multiple maxSize={20 * 1024 * 1024} onFilesChange={setFiles} />
<Badge tone="success" dot>Attending</Badge>
<Pill onRemove={() => removeTag('Family')}>Family</Pill>
<Stepper steps={[{ label: 'Details' }, { label: 'Design' }, { label: 'Send' }]} current={1} />
<Tabs aria-label="Settings" items={[{ value: 'details', label: 'Details', content: <Details /> }, { value: 'design', label: 'Design' }]} />
<Modal open={open} onClose={() => setOpen(false)} eyebrow="Step 3 of 3" title="Send invitations?" footer={<Button>Send</Button>} />
<Modal open={open} dismissible={false} title="Before you continue" footer={�} /> {/* no � / Escape / backdrop close */}
```

All components forward refs and accept their native element's props.

## Development

```sh
npm install
npm run storybook   # component docs on http://localhost:6006
npm run build       # icons, fonts, JS + types, CSS → dist/
```
