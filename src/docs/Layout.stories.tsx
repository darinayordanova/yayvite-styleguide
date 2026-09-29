import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ClassChip } from './CopyButton';
import { ClassGrid, type ClassRow } from './ClassGrid';
import { breakpoints } from './tokens';

const meta = {
  title: 'Utilities/Layout',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Box({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`bg-rose-100 border border-rose-300 rounded-md p-3 text-body-sm text-rose-900 ${className}`}>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h3 className="text-label text-neutral-500 mb-4">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Layout and spacing classes are mobile-first. Prefix any of them with a breakpoint to apply it
 * from that width up: `md-grid-cols-3`, `lg-hidden`, `md-px-8`.
 */
export const Breakpoints: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr className="text-label text-neutral-500 text-left">
          {['Prefix', 'Min width', 'Example'].map((h) => (
            <th key={h} className="py-2 px-4" style={{ fontWeight: 'inherit' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {breakpoints.map(({ name, px }) => (
          <tr key={name} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
            <td className="py-3 px-4 text-body-sm font-semibold text-neutral-900">{name}-</td>
            <td className="py-3 px-4 text-body-sm text-neutral-700">{px}px</td>
            <td className="py-3 px-4">
              <ClassChip name={`${name}-grid-cols-2`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** Full width with side padding, capped at the current breakpoint's width and centered. */
export const Container: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="bg-neutral-100 py-8">
      <div className="container">
        <Box>
          <code>.container</code> — resize the viewport to see the max width step up.
        </Box>
      </div>
    </div>
  ),
};

const gridClasses: ClassRow[] = [
  ['grid', 'display: grid'],
  ['inline-grid', 'display: inline-grid'],
  ['grid-cols-{1–12}', 'grid-template-columns: repeat(n, minmax(0, 1fr))'],
  ['grid-cols-none', 'grid-template-columns: none'],
  ['col-span-{1–12}', 'grid-column: span n / span n'],
  ['col-span-full', 'grid-column: 1 / -1'],
  ['col-auto', 'grid-column: auto'],
  ['col-start-{1–13}', 'grid-column-start: n'],
  ['col-end-{1–13}', 'grid-column-end: n'],
  ['grid-rows-{1–6}', 'grid-template-rows: repeat(n, minmax(0, 1fr))'],
  ['row-span-{1–6}', 'grid-row: span n / span n'],
  ['row-span-full', 'grid-row: 1 / -1'],
  ['row-auto', 'grid-row: auto'],
  ['grid-flow-row', 'grid-auto-flow: row'],
  ['grid-flow-col', 'grid-auto-flow: column'],
  ['grid-flow-dense', 'grid-auto-flow: dense'],
  ['grid-flow-row-dense', 'grid-auto-flow: row dense'],
];

/** A 12-column grid. Columns share the width equally and never overflow their content. */
export const Grid: Story = {
  render: () => (
    <div>
      <Section title="grid grid-cols-1 md-grid-cols-3 gap-4">
        <div className="grid grid-cols-1 md-grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Box key={n}>{n}</Box>
          ))}
        </div>
      </Section>

      <Section title="grid-cols-12 with col-span-*">
        <div className="grid grid-cols-12 gap-4">
          <Box className="col-span-12 md-col-span-8">col-span-12 md-col-span-8</Box>
          <Box className="col-span-12 md-col-span-4">col-span-12 md-col-span-4</Box>
          <Box className="col-span-4">col-span-4</Box>
          <Box className="col-span-4 col-start-9">col-span-4 col-start-9</Box>
          <Box className="col-span-full">col-span-full</Box>
        </div>
      </Section>

      <Section title="Classes">
        <ClassGrid rows={gridClasses} />
      </Section>
    </div>
  ),
};

const flexClasses: ClassRow[] = [
  ['flex', 'display: flex'],
  ['inline-flex', 'display: inline-flex'],
  ['flex-row', 'flex-direction: row'],
  ['flex-row-reverse', 'flex-direction: row-reverse'],
  ['flex-col', 'flex-direction: column'],
  ['flex-col-reverse', 'flex-direction: column-reverse'],
  ['flex-wrap', 'flex-wrap: wrap'],
  ['flex-nowrap', 'flex-wrap: nowrap'],
  ['flex-1', 'flex: 1 1 0%'],
  ['flex-auto', 'flex: 1 1 auto'],
  ['flex-none', 'flex: none'],
  ['grow', 'flex-grow: 1'],
  ['grow-0', 'flex-grow: 0'],
  ['shrink', 'flex-shrink: 1'],
  ['shrink-0', 'flex-shrink: 0'],
  ['order-first', 'order: -9999'],
  ['order-last', 'order: 9999'],
];

export const Flex: Story = {
  render: () => (
    <div>
      <Section title="flex flex-col md-flex-row gap-4">
        <div className="flex flex-col md-flex-row gap-4">
          <Box className="flex-1">flex-1</Box>
          <Box className="flex-1">flex-1</Box>
          <Box className="shrink-0">shrink-0</Box>
        </div>
      </Section>

      <Section title="flex items-center justify-between">
        <div className="flex items-center justify-between bg-neutral-100 rounded-md p-3">
          <Box>Left</Box>
          <Box className="py-6">Taller</Box>
          <Box>Right</Box>
        </div>
      </Section>

      <Section title="Classes">
        <ClassGrid rows={flexClasses} />
      </Section>
    </div>
  ),
};

/** Work with both flex and grid containers. */
export const Alignment: Story = {
  render: () => (
    <div>
      <Section title="Align items (cross axis)">
        <ClassGrid
          rows={[
            ['items-start', 'align-items: flex-start'],
            ['items-end', 'align-items: flex-end'],
            ['items-center', 'align-items: center'],
            ['items-baseline', 'align-items: baseline'],
            ['items-stretch', 'align-items: stretch'],
          ]}
        />
      </Section>
      <Section title="Justify content (main axis)">
        <ClassGrid
          rows={[
            ['justify-start', 'justify-content: flex-start'],
            ['justify-end', 'justify-content: flex-end'],
            ['justify-center', 'justify-content: center'],
            ['justify-between', 'justify-content: space-between'],
            ['justify-around', 'justify-content: space-around'],
            ['justify-evenly', 'justify-content: space-evenly'],
          ]}
        />
      </Section>
      <Section title="Justify items (grid)">
        <ClassGrid
          rows={[
            ['justify-items-start', 'justify-items: start'],
            ['justify-items-end', 'justify-items: end'],
            ['justify-items-center', 'justify-items: center'],
            ['justify-items-stretch', 'justify-items: stretch'],
          ]}
        />
      </Section>
      <Section title="Self and place">
        <ClassGrid
          rows={[
            ['self-auto', 'align-self: auto'],
            ['self-start', 'align-self: flex-start'],
            ['self-end', 'align-self: flex-end'],
            ['self-center', 'align-self: center'],
            ['self-stretch', 'align-self: stretch'],
            ['place-items-center', 'place-items: center'],
            ['place-content-center', 'place-content: center'],
          ]}
        />
      </Section>
    </div>
  ),
};

export const General: Story = {
  render: () => (
    <div>
      <Section title="Display">
        <ClassGrid
          rows={[
            ['block', 'display: block'],
            ['inline-block', 'display: inline-block'],
            ['inline', 'display: inline'],
            ['flex', 'display: flex'],
            ['inline-flex', 'display: inline-flex'],
            ['grid', 'display: grid'],
            ['inline-grid', 'display: inline-grid'],
            ['contents', 'display: contents'],
            ['hidden', 'display: none'],
          ]}
        />
      </Section>
      <Section title="Position">
        <ClassGrid
          rows={[
            ['static', 'position: static'],
            ['relative', 'position: relative'],
            ['absolute', 'position: absolute'],
            ['fixed', 'position: fixed'],
            ['sticky', 'position: sticky'],
            ['inset-0', 'inset: 0'],
            ['top-0', 'top: 0'],
            ['right-0', 'right: 0'],
            ['bottom-0', 'bottom: 0'],
            ['left-0', 'left: 0'],
          ]}
        />
      </Section>
      <Section title="Sizing">
        <ClassGrid
          rows={[
            ['w-full', 'width: 100%'],
            ['w-auto', 'width: auto'],
            ['w-screen', 'width: 100vw'],
            ['h-full', 'height: 100%'],
            ['h-auto', 'height: auto'],
            ['h-screen', 'height: 100dvh'],
            ['min-w-0', 'min-width: 0'],
            ['min-h-screen', 'min-height: 100dvh'],
            ['max-w-xs', 'max-width: 20rem (320px)'],
            ['max-w-sm', 'max-width: 24rem (384px)'],
            ['max-w-md', 'max-width: 28rem (448px)'],
            ['max-w-lg', 'max-width: 32rem (512px)'],
            ['max-w-xl', 'max-width: 36rem (576px)'],
            ['max-w-2xl', 'max-width: 42rem (672px)'],
            ['max-w-3xl', 'max-width: 48rem (768px)'],
            ['max-w-4xl', 'max-width: 56rem (896px)'],
            ['max-w-prose', 'max-width: 65ch'],
            ['max-w-full', 'max-width: 100%'],
            ['max-w-none', 'max-width: none'],
          ]}
        />
      </Section>
      <Section title="Overflow">
        <ClassGrid
          rows={[
            ['overflow-hidden', 'overflow: hidden'],
            ['overflow-auto', 'overflow: auto'],
            ['overflow-visible', 'overflow: visible'],
            ['overflow-x-auto', 'overflow-x: auto'],
            ['overflow-y-auto', 'overflow-y: auto'],
          ]}
        />
      </Section>
      <Section title="Text alignment">
        <ClassGrid
          rows={[
            ['text-left', 'text-align: left'],
            ['text-center', 'text-align: center'],
            ['text-right', 'text-align: right'],
          ]}
        />
      </Section>
      <Section title="Borders and radius (not responsive)">
        <ClassGrid
          rows={[
            ['border', '1px solid neutral-300'],
            ['border-0', 'border-width: 0'],
            ['rounded-none', 'border-radius: 0'],
            ['rounded-sm', 'border-radius: var(--radius-sm)'],
            ['rounded-md', 'border-radius: var(--radius-md)'],
            ['rounded-lg', 'border-radius: var(--radius-lg)'],
            ['rounded-full', 'border-radius: var(--radius-full)'],
          ]}
        />
      </Section>
      <Section title="Other (not responsive)">
        <ClassGrid
          rows={[
            ['truncate', 'one line, ellipsis on overflow'],
            ['whitespace-nowrap', 'white-space: nowrap'],
            ['sr-only', 'visually hidden, read by screen readers'],
            ['aspect-square', 'aspect-ratio: 1 / 1'],
            ['aspect-video', 'aspect-ratio: 16 / 9'],
            ['object-cover', 'object-fit: cover'],
            ['object-contain', 'object-fit: contain'],
            ['z-{0|10|20|30|40|50}', 'z-index: n'],
          ]}
        />
      </Section>
    </div>
  ),
};
