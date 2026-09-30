import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Stepper } from './Stepper';

const steps = [
  { label: 'Details', description: 'Names and date' },
  { label: 'Design', description: 'Pick a template' },
  { label: 'Guests', description: 'Add your list' },
  { label: 'Send', description: 'Review and send' },
];

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { steps, current: 1 },
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Vertical: Story = { args: { orientation: 'vertical', current: 2 } };

/** Completed steps are clickable when `onStepClick` is set. */
export const Interactive: Story = {
  render: function Render() {
    const [current, setCurrent] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 32 }}>
        <Stepper steps={steps} current={current} onStepClick={setCurrent} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            Back
          </Button>
          <Button
            iconEnd="arrow"
            disabled={current === steps.length}
            onClick={() => setCurrent((c) => c + 1)}
          >
            {current >= steps.length - 1 ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </div>
    );
  },
};
