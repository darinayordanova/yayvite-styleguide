import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TextArea } from './TextArea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: { label: 'Message to guests', placeholder: 'We can’t wait to celebrate with you…' },
  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'Shown on the invitation below your names' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px 20px' }}>
      <TextArea aria-label="Note" placeholder="Add a note" helperText="This is optional" rows={3} />
      <TextArea aria-label="Note" defaultValue="Dinner starts at seven, dancing after." rows={3} />
      <TextArea aria-label="Note" defaultValue="Hi" rows={3} error="Write at least 10 characters" />
      <TextArea aria-label="Note" defaultValue="Replies are closed." rows={3} disabled />
    </div>
  ),
};

/** Shows `length / maxLength`, and turns warm once the limit is reached. */
export const WithCount: Story = {
  args: {
    showCount: true,
    maxLength: 160,
    defaultValue: 'Join us for an evening of love, laughter and happily ever after.',
  },
};

/** Grows with its content from `rows` up to `maxRows`, then scrolls. */
export const AutoResize: Story = {
  args: { autoResize: true, rows: 2, maxRows: 8, helperText: 'Grows up to 8 lines' },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [text, setText] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <TextArea {...args} value={text} onChange={(e) => setText(e.target.value)} showCount autoResize />
        <p style={{ margin: 0, fontSize: 12 }}>Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</p>
      </div>
    );
  },
};
