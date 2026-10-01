import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ColorInput } from './ColorInput';

const meta = {
  title: 'Components/ColorInput',
  component: ColorInput,
  args: { label: 'Accent color', defaultValue: '#3e5e50' },
  decorators: [(Story) => <div style={{ width: 246, minHeight: 380 }}>{Story()}</div>],
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type or paste any CSS color — `#abc`, `3e5e50`, `rgb(150 99 93)`, `teal` — or open the picker from the swatch. */
export const Playground: Story = { args: { helperText: 'Hex, rgb(), hsl() or a color name' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780, minHeight: 380 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <ColorInput aria-label="Color" helperText="No color yet" />
      <ColorInput aria-label="Color" defaultValue="#c8958d" />
      <ColorInput aria-label="Color" defaultValue="#96635d" error="Too little contrast with white" />
      <ColorInput aria-label="Color" defaultValue="#799486" disabled />
    </div>
  ),
};

export const CustomSwatches: Story = {
  args: {
    label: 'Text color',
    defaultValue: '#29302d',
    swatches: ['#29302d', '#626b67', '#999f9c', '#d9dcd9', '#f4f4f0', '#ffffff', '#a54d4d', '#456b78'],
  },
};

export const NoSwatches: Story = { args: { swatches: [] } };

export const Controlled: Story = {
  render: function Render(args) {
    const [color, setColor] = useState('#96635d');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <ColorInput {...args} value={color} onChange={setColor} name="accent" />
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            height: 64,
            borderRadius: 8,
            background: color || 'transparent',
            color: '#fff',
            fontSize: 12,
          }}
        >
          {color || 'No color'}
        </div>
      </div>
    );
  },
};
