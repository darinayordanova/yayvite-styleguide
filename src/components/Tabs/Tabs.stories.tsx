import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    'aria-label': 'Event settings',
    items: [
      { value: 'details', label: 'Details', content: 'Names, date and venue of your celebration.' },
      { value: 'design', label: 'Design', content: 'Colors, fonts and the invitation layout.' },
      { value: 'guests', label: 'Guests', content: 'Your guest list and plus ones.' },
      { value: 'rsvp', label: 'RSVP', content: 'Questions guests answer when they reply.' },
    ],
  },
  decorators: [(Story) => <div style={{ width: 520 }}>{Story()}</div>],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithIcons: Story = {
  args: {
    items: [
      { value: 'desktop', label: 'Desktop', icon: 'desktop' },
      { value: 'mobile', label: 'Mobile', icon: 'mobile' },
      { value: 'email', label: 'Email', icon: 'mail' },
    ],
  },
};

export const FullWidth: Story = { args: { fullWidth: true } };

export const Disabled: Story = {
  args: {
    items: [
      { value: 'details', label: 'Details' },
      { value: 'design', label: 'Design' },
      { value: 'guests', label: 'Guests', disabled: true },
      { value: 'rsvp', label: 'RSVP' },
    ],
  },
};

/** Without `content`, the tabs only switch state and you render the panel yourself. */
export const Controlled: Story = {
  args: {
    items: [
      { value: 'all', label: 'All guests' },
      { value: 'attending', label: 'Attending' },
      { value: 'declined', label: 'Declined' },
      { value: 'pending', label: 'Awaiting reply' },
    ],
  },
  render: function Render(args) {
    const [tab, setTab] = useState('attending');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Tabs {...args} value={tab} onChange={setTab} />
        <p style={{ margin: 0, fontSize: 12 }}>Showing: {tab}</p>
      </div>
    );
  },
};
