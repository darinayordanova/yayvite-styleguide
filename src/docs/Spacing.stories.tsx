import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClassChip } from './CopyButton';
import { spaceSteps } from './tokens';

const prefixes = {
  m: 'margin',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
  mx: 'margin-inline',
  my: 'margin-block',
  p: 'padding',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
  px: 'padding-inline',
  py: 'padding-block',
  gap: 'gap',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
} as const;

type Prefix = keyof typeof prefixes;

interface SpacingArgs {
  property: Prefix;
}

const meta = {
  title: 'Utilities/Spacing',
  parameters: { layout: 'padded' },
  args: { property: 'm' },
  argTypes: {
    property: {
      name: 'Property',
      control: 'select',
      options: Object.keys(prefixes),
      labels: Object.fromEntries(Object.entries(prefixes).map(([k, v]) => [k, `${k} — ${v}`])),
    },
  },
} satisfies Meta<SpacingArgs>;

export default meta;
type Story = StoryObj<SpacingArgs>;

const cell = { padding: '10px 16px', borderTop: '1px solid var(--color-neutral-100)', verticalAlign: 'middle' };

/** Pick a property in the Controls panel to see its classes. All steps are multiples of 4px. */
export const Scale: Story = {
  render: ({ property }) => (
    <div>
      <p className="text-body text-neutral-700" style={{ marginTop: 0 }}>
        <code>.{property}-{'{step}'}</code> sets <code>{prefixes[property]}</code> to step × 4px.
      </p>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="text-label text-neutral-500" style={{ textAlign: 'left' }}>
            {['Step', 'Value', '', 'Class', 'Token'].map((h, i) => (
              <th key={i} style={{ padding: '8px 16px', fontWeight: 'inherit' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spaceSteps.map(({ step, px }) => (
            <tr key={step}>
              <td style={cell} className="text-body-sm font-semibold text-neutral-900">
                {step}
              </td>
              <td style={cell} className="text-body-sm text-neutral-700">
                {px}px
              </td>
              <td style={{ ...cell, width: 110 }}>
                <div className="bg-rose-300" style={{ width: px, height: 16, borderRadius: 2 }} />
              </td>
              <td style={cell}>
                <ClassChip name={`${property}-${step}`} />
              </td>
              <td style={cell}>
                <code className="text-body-sm text-neutral-500">var(space-{step})</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const Auto: Story = {
  name: 'Auto margins',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ClassChip name="m-auto" />
      <ClassChip name="mx-auto" />
    </div>
  ),
};
