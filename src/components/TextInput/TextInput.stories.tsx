import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from './TextInput';

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  args: { 'aria-label': 'Full name', placeholder: 'Enter your full name' },
  decorators: [(Story) => <div style={{ width: 246 }}>{Story()}</div>],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { label: 'Full name', helperText: 'This is optional' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <TextInput aria-label="Full name" placeholder="Enter your full name" helperText="This is optional" />
      <TextInput aria-label="Name" defaultValue="Mia Evans" success />
      <TextInput aria-label="Email" placeholder="name@example.com" iconStart="mail" autoFocus />
      <TextInput aria-label="Email" defaultValue="mia@" iconStart="mail" error="Enter a valid email address" />
      <TextInput aria-label="Status" defaultValue="Not available" disabled />
      <TextInput aria-label="Password" type="password" helperText="At least 8 characters" />
    </div>
  ),
};

/** `prefix` shows fixed text before the value. It is not part of the value. */
export const WithPrefix: Story = {
  decorators: [(Story) => <div style={{ width: 780 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <TextInput label="Website" prefix="yayvite.com/" placeholder="mia-and-tom" />
      <TextInput label="Gift amount" prefix="€" inputMode="decimal" defaultValue="150" />
      <TextInput label="Link" prefix="https://" iconEnd="link" defaultValue="mia@" error="Enter a valid link" />
    </div>
  ),
};
