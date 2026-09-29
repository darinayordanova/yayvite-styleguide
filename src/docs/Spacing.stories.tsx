import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ClassChip } from './CopyButton';
import { ClassGrid } from './ClassGrid';
import { spaceSteps } from './tokens';

const meta = {
  title: 'Utilities/Spacing',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Prefixes = Record<string, string>;

const padding: Prefixes = {
  p: 'padding',
  px: 'padding-inline',
  py: 'padding-block',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
};

const margin: Prefixes = {
  m: 'margin',
  mx: 'margin-inline',
  my: 'margin-block',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
};

const gap: Prefixes = {
  gap: 'gap',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
};

const spaceBetween: Prefixes = {
  'space-x': 'margin-left between children',
  'space-y': 'margin-top between children',
};

const cell = 'py-2 px-3 text-left';

/** Every step of the scale, one column per class prefix. */
function ScaleGrid({ prefixes, intro }: { prefixes: Prefixes; intro: ReactNode }) {
  return (
    <div>
      <p className="text-body text-neutral-700 mt-0 mb-4">{intro}</p>
      <div className="overflow-x-auto">
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="text-label text-neutral-500">
              <th className={cell} style={{ fontWeight: 'inherit' }}>
                Step
              </th>
              <th className={cell} style={{ fontWeight: 'inherit' }}>
                Value
              </th>
              <th className={cell} />
              {Object.entries(prefixes).map(([prefix, property]) => (
                <th key={prefix} className={cell} style={{ fontWeight: 'inherit' }}>
                  <div>{prefix}</div>
                  <div className="text-neutral-500" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
                    {property}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spaceSteps.map(({ step, px }) => (
              <tr key={step} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                <td className={`${cell} text-body-sm font-semibold text-neutral-900`}>{step}</td>
                <td className={`${cell} text-body-sm text-neutral-700 whitespace-nowrap`}>{px}px</td>
                <td className={cell} style={{ width: 110 }}>
                  <div className="bg-rose-300" style={{ width: px, height: 16, borderRadius: 2 }} />
                </td>
                {Object.keys(prefixes).map((prefix) => (
                  <td key={prefix} className={cell}>
                    <ClassChip name={`${prefix}-${step}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** All steps are multiples of 4px. Every class also takes a breakpoint prefix, e.g. `md-p-8`. */
export const Padding: Story = {
  render: () => (
    <ScaleGrid
      prefixes={padding}
      intro={
        <>
          <code>.p-{'{step}'}</code> sets padding to step × 4px. <code>px</code> and <code>py</code> set
          left + right and top + bottom.
        </>
      }
    />
  ),
};

export const Margin: Story = {
  render: () => (
    <div>
      <ScaleGrid
        prefixes={margin}
        intro={
          <>
            <code>.m-{'{step}'}</code> sets margin to step × 4px. <code>mx</code> and <code>my</code> set
            left + right and top + bottom.
          </>
        }
      />
      <h3 className="text-label text-neutral-500 mt-10 mb-4">Auto margins</h3>
      <ClassGrid
        rows={[
          ['m-auto', 'margin: auto'],
          ['mx-auto', 'margin-inline: auto'],
          ['my-auto', 'margin-block: auto'],
          ['mt-auto', 'margin-top: auto'],
          ['mr-auto', 'margin-right: auto'],
          ['mb-auto', 'margin-bottom: auto'],
          ['ml-auto', 'margin-left: auto'],
        ]}
      />
    </div>
  ),
};

/** Space between the items of a flex or grid container. */
export const Gap: Story = {
  render: () => (
    <ScaleGrid
      prefixes={gap}
      intro={
        <>
          <code>.gap-{'{step}'}</code> spaces the items of a flex or grid container.
        </>
      }
    />
  ),
};

/** Space between children without making the parent a flex or grid container. */
export const SpaceBetween: Story = {
  name: 'Space between',
  render: () => (
    <div>
      <div className="space-y-3 mb-8" style={{ maxWidth: 320 }}>
        {['First', 'Second', 'Third'].map((label) => (
          <div key={label} className="bg-rose-100 border border-rose-300 rounded-md p-3 text-body-sm text-rose-900">
            {label} <span className="text-neutral-500">(space-y-3)</span>
          </div>
        ))}
      </div>
      <ScaleGrid
        prefixes={spaceBetween}
        intro={
          <>
            <code>.space-y-{'{step}'}</code> adds a top margin to every child except the first.
          </>
        }
      />
    </div>
  ),
};

/**
 * Spacing is mobile-first: a plain class applies at every width, and a prefixed class overrides it
 * from that breakpoint up. To use 20px on mobile only, set it and reset it at the next breakpoint.
 */
export const Responsive: Story = {
  render: () => (
    <div>
      <ClassGrid
        rows={[
          ['p-5 sm-p-0', '20px padding below 640px only'],
          ['p-5 md-p-0', '20px padding below 768px only'],
          ['px-4 md-px-8 lg-px-12', '16px → 32px → 48px'],
          ['mb-6 md-mb-10', '24px, then 40px from 768px'],
          ['gap-4 lg-gap-8', '16px, then 32px from 1024px'],
        ]}
      />
      <p className="text-body-sm text-neutral-500 mt-6 mb-3">
        Live example: <code>p-5 md-p-0</code> — resize the viewport below 768px to see the padding.
      </p>
      <div className="bg-rose-300 rounded-md" style={{ maxWidth: 400 }}>
        <div className="p-5 md-p-0">
          <div className="bg-white rounded-md p-3 text-body-sm text-neutral-900">Content</div>
        </div>
      </div>
    </div>
  ),
};
