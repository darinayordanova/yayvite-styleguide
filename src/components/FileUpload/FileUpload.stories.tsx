import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload } from './FileUpload';

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  args: {
    label: 'Photos & videos',
    helperText: 'JPG, PNG, MP4 or MOV, up to 20 MB each',
    multiple: true,
    maxSize: 20 * 1024 * 1024,
    maxFiles: 6,
  },
  decorators: [(Story) => <div style={{ width: 420 }}>{Story()}</div>],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** One file; choosing another replaces it. */
export const SingleImage: Story = {
  args: {
    label: 'Cover photo',
    accept: 'image/*',
    multiple: false,
    helperText: 'JPG or PNG, up to 5 MB',
    maxSize: 5 * 1024 * 1024,
  },
};

export const WithError: Story = { args: { error: 'Add at least one photo' } };

export const Disabled: Story = { args: { disabled: true } };
