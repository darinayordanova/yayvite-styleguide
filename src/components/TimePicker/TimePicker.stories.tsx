import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TimePicker } from './TimePicker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  args: { label: 'Ceremony time', placeholder: 'Choose a time' },
  decorators: [(Story) => <div style={{ width: 246, minHeight: 320 }}>{Story()}</div>],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'Guests see this on the invitation' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780, minHeight: 320 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <TimePicker aria-label="Time" placeholder="Choose a time" helperText="This is optional" />
      <TimePicker aria-label="Time" defaultValue="16:30" />
      <TimePicker aria-label="Time" defaultValue="16:30" step={15} />
      <TimePicker aria-label="Time" placeholder="Choose a time" error="Pick a time" />
      <TimePicker aria-label="Time" defaultValue="16:30" disabled />
    </div>
  ),
};

/** `hour12={false}` drops the AM/PM column and lists hours 00–23. */
export const TwentyFourHour: Story = {
  args: { label: 'Reception starts', hour12: false, defaultValue: '18:15' },
};

export const Controlled: Story = {
  render: function Render() {
    const [time, setTime] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <TimePicker label="Ceremony time" value={time} onChange={setTime} name="time" />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {time || '—'}</p>
      </div>
    );
  },
};
