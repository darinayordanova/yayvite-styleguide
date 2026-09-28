import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { label: 'Digital invitations', name: 'playground' },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Group: Story = {
  render: () => (
    <fieldset style={{ display: 'grid', gap: 15, margin: 0, padding: 0, border: 0 }}>
      <legend className="text-label text-neutral-500 mb-4">Invitation type</legend>
      <Radio name="format" value="digital" label="Digital invitations" defaultChecked />
      <Radio name="format" value="printed" label="Printed invitations" />
      <Radio name="format" value="both" label="Digital + print" />
    </fieldset>
  ),
};
