import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TimePicker } from '../TimePicker/TimePicker';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: { label: 'Wedding date', placeholder: 'Choose a date' },
  decorators: [(Story) => <div style={{ width: 246, minHeight: 400 }}>{Story()}</div>],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'You can change this later' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780, minHeight: 400 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <DatePicker aria-label="Date" placeholder="Choose a date" helperText="This is optional" />
      <DatePicker aria-label="Date" defaultValue="2027-06-12" />
      <DatePicker aria-label="Date" defaultValue="2027-06-12" weekStartsOn={0} locale="en-US" />
      <DatePicker aria-label="Date" placeholder="Choose a date" error="Pick a date" />
      <DatePicker aria-label="Date" defaultValue="2027-06-12" disabled />
    </div>
  ),
};

/** Days outside `min` and `max` can't be picked, and the month buttons stop at the range. */
export const Range: Story = {
  args: { label: 'RSVP deadline', defaultValue: '2027-05-14', min: '2027-04-20', max: '2027-06-05' },
};

export const Controlled: Story = {
  render: function Render() {
    const [date, setDate] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <DatePicker label="Wedding date" value={date} onChange={setDate} name="date" />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {date || '—'}</p>
      </div>
    );
  },
};

export const WithTime: Story = {
  decorators: [(Story) => <div style={{ width: 420, minHeight: 400 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <DatePicker label="Ceremony date" defaultValue="2027-06-12" />
      <TimePicker label="Ceremony time" defaultValue="16:30" />
    </div>
  ),
};
