import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Pending', tone: 'warning' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 15 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Badge tone="success">Attending</Badge>
        <Badge tone="warning">Pending</Badge>
        <Badge tone="error">Declined</Badge>
        <Badge tone="info">Invited</Badge>
        <Badge tone="neutral">Draft</Badge>
        <Badge tone="evergreen">Family</Badge>
        <Badge tone="rose">Bridal party</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Badge tone="success" dot>Sent</Badge>
        <Badge tone="warning" dot>Scheduled</Badge>
        <Badge tone="error" dot>Bounced</Badge>
        <Badge tone="evergreen" icon="sparkle">New</Badge>
        <Badge tone="info" icon="clock">2 days left</Badge>
      </div>
    </div>
  ),
};
