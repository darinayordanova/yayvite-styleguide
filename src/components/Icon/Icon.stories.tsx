import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../../icons/generated/icon-names';
import { CopyButton } from '../../docs/CopyButton';
import { Icon } from './Icon';

const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  args: { name: 'heart', size: 24 },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
      {iconNames.map((name) => (
        <div
          key={name}
          className="text-evergreen-700 p-4"
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 10,
            border: '1px solid var(--color-neutral-100)',
            borderRadius: 8,
          }}
        >
          <span
            className="bg-evergreen-100"
            style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10 }}
          >
            <Icon name={name} />
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <code
              className="text-neutral-700"
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, whiteSpace: 'nowrap' }}
            >
              icon-{name}
            </code>
            <CopyButton text={`icon icon-${name}`} />
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="text-evergreen-700" style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
      <Icon name="heart" size={16} />
      <Icon name="heart" size={20} />
      <Icon name="heart" size={24} />
      <Icon name="heart" size={32} />
    </div>
  ),
};
