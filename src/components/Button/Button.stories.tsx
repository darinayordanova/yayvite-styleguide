import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '../../icons/generated/icon-names';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button label', variant: 'primary', size: 'md' },
  argTypes: {
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
    iconEnd: { control: 'select', options: [undefined, ...iconNames] },
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const variants = ['primary', 'secondary', 'tertiary', 'destructive'] as const;

/** Mirrors the variant matrix in the Figma "Buttons" frame. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 40 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'contents' }}>
          <Button variant={variant}>Button label</Button>
          <Button variant={variant} iconEnd="arrow">
            Continue
          </Button>
          <Button variant={variant} disabled>
            Button label
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button size="lg">Large button</Button>
      <Button size="md">Medium button</Button>
      <Button size="sm">Small button</Button>
    </div>
  ),
};
