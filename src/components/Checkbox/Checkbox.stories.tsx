import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Include RSVP card' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 15 }}>
      <Checkbox label="Include RSVP card" defaultChecked />
      <Checkbox label="Add return address" />
      <Checkbox label="Disabled option" disabled />
    </div>
  ),
};
