import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MultiSelect } from './MultiSelect';

const dietOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'dairy-free', label: 'Dairy-free' },
  { value: 'nut-allergy', label: 'Nut allergy' },
  { value: 'kosher', label: 'Kosher', disabled: true },
];

const countries = [
  'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Denmark', 'France', 'Germany', 'Greece',
  'Ireland', 'Italy', 'Netherlands', 'Norway', 'Portugal', 'Spain', 'Sweden', 'United Kingdom',
  'United States',
].map((c) => ({ value: c.toLowerCase().replace(/ /g, '-'), label: c }));

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: { label: 'Dietary needs', options: dietOptions, placeholder: 'Choose all that apply' },
  decorators: [(Story) => <div style={{ width: 300, minHeight: 320 }}>{Story()}</div>],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'We share this with the caterer' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 900, minHeight: 360 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px', alignItems: 'start' }}>
      <MultiSelect aria-label="Diet" options={dietOptions} placeholder="Choose all that apply" helperText="This is optional" />
      <MultiSelect aria-label="Diet" options={dietOptions} defaultValue={['vegan', 'gluten-free']} />
      <MultiSelect aria-label="Countries" options={countries} iconStart="globe" placeholder="Countries" />
      <MultiSelect aria-label="Diet" options={dietOptions} placeholder="Choose all that apply" error="Pick at least one option" />
      <MultiSelect aria-label="Diet" options={dietOptions} defaultValue={['vegetarian', 'dairy-free']} disabled />
    </div>
  ),
};

/** The list stays open while picking; Backspace removes the last selected value. */
export const Controlled: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['france', 'italy']);
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <MultiSelect label="Countries" options={countries} value={selected} onChange={setSelected} name="countries" />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {selected.join(', ') || '—'}</p>
      </div>
    );
  },
};
