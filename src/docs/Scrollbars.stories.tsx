import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Scrollbars',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const lines = Array.from({ length: 40 }, (_, i) => i + 1);

/** Every scrollable element gets the macOS-style scrollbar from `scrollbars.css`. */
export const Default: Story = {
  render: () => (
    <div className="flex gap-6">
      <div className="overflow-y-auto border border-neutral-300 rounded-md p-4" style={{ width: 280, height: 240 }}>
        {lines.map((n) => (
          <p key={n} className="text-body text-neutral-700">
            Vertical scroll, line {n}
          </p>
        ))}
      </div>
      <div className="overflow-auto border border-neutral-300 rounded-md p-4" style={{ width: 280, height: 240 }}>
        <div style={{ width: 640 }}>
          {lines.map((n) => (
            <p key={n} className="text-body text-neutral-700 whitespace-nowrap">
              Scrolls both ways, line {n} with extra text to overflow horizontally
            </p>
          ))}
        </div>
      </div>
    </div>
  ),
};
