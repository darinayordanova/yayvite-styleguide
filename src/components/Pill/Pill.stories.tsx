import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Pill } from './Pill';

const meta = {
  title: 'Components/Pill',
  component: Pill,
  args: { children: 'Vegetarian', onRemove: fn() },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <Pill>Evergreen</Pill>
      <Pill tone="rose">Rose</Pill>
      <Pill tone="neutral">Neutral</Pill>
      <Pill tone="success">Success</Pill>
      <Pill tone="warning">Warning</Pill>
      <Pill tone="error">Error</Pill>
      <Pill tone="info">Info</Pill>
      <Pill icon="users">Plus one</Pill>
      <Pill tone="rose" icon="heart" onRemove={() => {}}>
        Bridal party
      </Pill>
      <Pill tone="info" icon="info" onRemove={() => {}}>
        Awaiting reply
      </Pill>
      <Pill tone="success" icon="check" onRemove={() => {}}>
        Attending
      </Pill>
      <Pill onRemove={() => {}} disabled>
        Disabled
      </Pill>
    </div>
  ),
};

/** Remove pills with the × button. */
export const Removable: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['Family', 'Friends', 'Work', 'Plus one', 'Vegetarian']);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 320 }}>
        {tags.map((tag) => (
          <Pill key={tag} onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
            {tag}
          </Pill>
        ))}
      </div>
    );
  },
};
