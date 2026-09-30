import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select } from './Select';

const mealOptions = [
  { value: 'beef', label: 'Beef tenderloin' },
  { value: 'fish', label: 'Sea bass' },
  { value: 'veg', label: 'Wild mushroom risotto' },
  { value: 'vegan', label: 'Vegan harvest bowl' },
  { value: 'kids', label: 'Kids menu', disabled: true },
];

const countries = [
  'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Denmark', 'France', 'Germany', 'Greece',
  'Ireland', 'Italy', 'Netherlands', 'Norway', 'Portugal', 'Spain', 'Sweden', 'United Kingdom',
  'United States',
].map((c) => ({ value: c.toLowerCase().replace(/ /g, '-'), label: c }));

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Meal choice', options: mealOptions, placeholder: 'Choose a meal' },
  decorators: [(Story) => <div style={{ width: 246, minHeight: 280 }}>{Story()}</div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'You can change this until June 1' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780, minHeight: 320 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <Select aria-label="Meal" options={mealOptions} placeholder="Choose a meal" helperText="This is optional" />
      <Select aria-label="Meal" options={mealOptions} defaultValue="fish" />
      <Select aria-label="Country" options={countries} iconStart="globe" placeholder="Country" />
      <Select aria-label="Meal" options={mealOptions} placeholder="Choose a meal" error="Pick a meal for each guest" />
      <Select aria-label="Meal" options={mealOptions} defaultValue="veg" disabled />
    </div>
  ),
};

/** Long lists scroll; type a letter to jump to a match. */
export const Controlled: Story = {
  render: function Render() {
    const [country, setCountry] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Select label="Country" options={countries} value={country} onChange={setCountry} name="country" />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {country || '—'}</p>
      </div>
    );
  },
};
