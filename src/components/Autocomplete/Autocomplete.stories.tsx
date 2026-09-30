import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import type { SelectOption } from '../Select/Select';
import { Autocomplete } from './Autocomplete';

const countries = [
  'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Denmark', 'France', 'Germany', 'Greece',
  'Ireland', 'Italy', 'Netherlands', 'Norway', 'Portugal', 'Spain', 'Sweden', 'United Kingdom',
  'United States',
].map((c) => ({ value: c.toLowerCase().replace(/ /g, '-'), label: c }));

const guests = [
  { value: 'amelia', label: 'Amelia Hart' },
  { value: 'ben', label: 'Ben Okafor' },
  { value: 'clara', label: 'Clara Lindqvist' },
  { value: 'dimitar', label: 'Dimitar Petrov' },
  { value: 'elena', label: 'Elena Rossi', disabled: true },
];

const meta = {
  title: 'Components/Autocomplete',
  component: Autocomplete,
  args: { label: 'Country', options: countries, placeholder: 'Search countries', iconStart: 'search' },
  decorators: [(Story) => <div style={{ width: 246, minHeight: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { helperText: 'Start typing to narrow the list' } };

export const States: Story = {
  decorators: [(Story) => <div style={{ width: 780, minHeight: 320 }}>{Story()}</div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px 20px' }}>
      <Autocomplete aria-label="Guest" options={guests} placeholder="Find a guest" helperText="This is optional" />
      <Autocomplete aria-label="Guest" options={guests} defaultValue="ben" />
      <Autocomplete aria-label="Country" options={countries} iconStart="globe" placeholder="Country" />
      <Autocomplete aria-label="Guest" options={guests} placeholder="Find a guest" error="Pick a guest" />
      <Autocomplete aria-label="Guest" options={guests} defaultValue="clara" disabled />
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [country, setCountry] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Autocomplete
          label="Country"
          options={countries}
          value={country}
          onChange={setCountry}
          name="country"
          iconStart="search"
          placeholder="Search countries"
        />
        <p style={{ margin: 0, fontSize: 12 }}>Value: {country || '—'}</p>
      </div>
    );
  },
};

/** Options loaded as the user types; `filter={false}` leaves matching to the server. */
export const Remote: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!query) {
        setOptions([]);
        return;
      }
      setLoading(true);
      const timer = window.setTimeout(() => {
        setOptions(countries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())));
        setLoading(false);
      }, 600);
      return () => window.clearTimeout(timer);
    }, [query]);

    return (
      <Autocomplete
        label="Country"
        options={options}
        filter={false}
        loading={loading}
        onInputChange={setQuery}
        iconStart="search"
        placeholder="Search countries"
      />
    );
  },
};
