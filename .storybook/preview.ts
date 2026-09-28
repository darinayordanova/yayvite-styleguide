import type { Preview } from '@storybook/react-vite';
import '../src/css/fonts.scss';
import '../src/css/yayvite.scss';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        surface: { name: 'Surface', value: '#ffffff' },
        page: { name: 'Page', value: '#f4f4f0' },
      },
    },
    controls: { expanded: true },
  },
  initialGlobals: {
    backgrounds: { value: 'surface' },
  },
};

export default preview;
