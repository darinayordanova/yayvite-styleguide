import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: {
    'aria-label': 'Invitation format',
    options: [
      { value: 'digital', label: 'Digital' },
      { value: 'print', label: 'Print' },
      { value: 'both', label: 'Both' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', justifyItems: 'start', gap: 16 }}>
      <SegmentedControl {...args} size="lg" />
      <SegmentedControl {...args} size="md" />
      <SegmentedControl {...args} size="sm" />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    'aria-label': 'Preview',
    options: [
      { value: 'desktop', label: 'Desktop', icon: 'desktop' },
      { value: 'mobile', label: 'Mobile', icon: 'mobile' },
    ],
  },
};

/** Icon-only options need an `aria-label`. */
export const IconOnly: Story = {
  args: {
    'aria-label': 'Preview',
    size: 'sm',
    options: [
      { value: 'desktop', icon: 'desktop', 'aria-label': 'Desktop' },
      { value: 'mobile', icon: 'mobile', 'aria-label': 'Mobile' },
    ],
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'grid', justifyItems: 'start', gap: 16 }}>
      <SegmentedControl
        {...args}
        options={[
          { value: 'digital', label: 'Digital' },
          { value: 'print', label: 'Print', disabled: true },
          { value: 'both', label: 'Both' },
        ]}
      />
      <SegmentedControl {...args} disabled />
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render(args) {
    const [format, setFormat] = useState('print');
    return (
      <div style={{ display: 'grid', justifyItems: 'start', gap: 12 }}>
        <SegmentedControl {...args} value={format} onChange={setFormat} name="format" />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {format}</p>
      </div>
    );
  },
};
