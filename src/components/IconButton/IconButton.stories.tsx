import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../../icons/generated/icon-names';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'heart', 'aria-label': 'Like', size: 'md' },
  argTypes: { icon: { control: 'select', options: iconNames }, "aria-label": { control: "text" }, size: { control: "select", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton size="lg" icon="plus" aria-label="Add" />
      <IconButton size="md" icon="heart" aria-label="Like" />
      <IconButton size="sm" icon="menu" aria-label="Menu" />
      <IconButton size="md" icon="settings" aria-label="Settings" disabled />
    </div>
  ),
};
