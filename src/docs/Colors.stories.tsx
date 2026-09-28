import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClassChip } from './CopyButton';
import { colors, type ColorToken } from './tokens';

const meta = {
  title: 'Utilities/Colors',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const groups: Array<{ title: string; match: (c: ColorToken) => boolean }> = [
  { title: 'Evergreen', match: (c) => c.name.startsWith('evergreen') },
  { title: 'Rose', match: (c) => c.name.startsWith('rose') },
  { title: 'Neutral', match: (c) => c.name.startsWith('neutral') || c.name === 'white' },
  { title: 'Status', match: (c) => /^(success|warning|error|info)/.test(c.name) },
];

const cell = { padding: '12px 16px', borderTop: '1px solid var(----color-neutral-100)', verticalAlign: 'middle' };

export const AllColors: Story = {
  name: 'Colors',
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      {groups.map(({ title, match }) => (
        <section key={title}>
          <h2 className="text-h3 text-neutral-900 mb-4" style={{ marginTop: 0 }}>
            {title}
          </h2>
          <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: 150 }} />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="text-label text-neutral-500" style={{ textAlign: 'left' }}>
                {['Color', 'Token', 'Text', 'Background', 'Border'].map((h) => (
                  <th key={h} style={{ padding: '8px 16px', fontWeight: 'inherit' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.filter(match).map(({ name, hex }) => (
                <tr key={name}>
                  <td style={cell}>
                    <div
                      className={`bg-${name}`}
                      style={{ width: 48, height: 32, borderRadius: 8, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
                    />
                  </td>
                  <td style={cell}>
                    <div className="text-body-sm font-semibold text-neutral-900">{name}</div>
                    <div className="text-body-sm text-neutral-500">{hex.toUpperCase()}</div>
                  </td>
                  <td style={cell}>
                    <ClassChip name={`text-${name}`} />
                  </td>
                  <td style={cell}>
                    <ClassChip name={`bg-${name}`} />
                  </td>
                  <td style={cell}>
                    <ClassChip name={`border-${name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  ),
};
