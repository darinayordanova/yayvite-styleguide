import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  args: { label: 'Guest notifications', description: 'Send updates by email' },
  decorators: [(Story) => <div style={{ width: 201 }}>{Story()}</div>],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 15 }}>
      <Toggle label="Guest notifications" description="Send updates by email" defaultChecked />
      <Toggle label="Private event" description="Invite-only access" disabled />
    </div>
  ),
};
