import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClassChip } from './CopyButton';
import { fontWeights, typeStyles } from './tokens';

const meta = {
  title: 'Utilities/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const samples: Record<string, string> = {
  display: 'Your love, beautifully told',
  h1: 'A celebration to remember',
  h2: 'Designed for your story',
  h3: 'Invitation details',
  'body-lg': 'Create invitations that feel unmistakably yours.',
  body: 'Thoughtful tools for every step of your celebration.',
  'body-sm': 'Last edited a few moments ago',
  label: 'Wedding details',
};

const row = {
  display: 'grid',
  gridTemplateColumns: '1fr 220px',
  alignItems: 'center',
  gap: 24,
  padding: '20px 0',
  borderBottom: '1px solid var(--color-neutral-100)',
};

export const Styles: Story = {
  render: () => (
    <div>
      {typeStyles.map((s) => (
        <div key={s.name} style={row}>
          <div>
            <div className={`text-${s.name} text-neutral-900`}>{samples[s.name] ?? s.name}</div>
            <div className="text-body-sm text-neutral-500 mt-2">
              {s.family === 'serif' ? 'Playfair Display' : 'DM Sans'} · {s.size} / {s.lineHeight} · {s.weight}
              {s.letterSpacing !== '0' && ` · ${s.letterSpacing} tracking`}
            </div>
          </div>
          <ClassChip name={`text-${s.name}`} />
        </div>
      ))}
    </div>
  ),
};

export const FamiliesAndWeights: Story = {
  name: 'Families & weights',
  render: () => (
    <div>
      {(['serif', 'sans'] as const).map((family) => (
        <div key={family} style={row}>
          <div className={`font-${family} text-neutral-900`} style={{ fontSize: 24 }}>
            {family === 'serif' ? 'Playfair Display' : 'DM Sans'}
          </div>
          <ClassChip name={`font-${family}`} />
        </div>
      ))}
      {fontWeights.map((weight) => (
        <div key={weight} style={row}>
          <div className={`font-sans font-${weight} text-neutral-900`} style={{ fontSize: 20 }}>
            DM Sans {weight}
          </div>
          <ClassChip name={`font-${weight}`} />
        </div>
      ))}
    </div>
  ),
};
