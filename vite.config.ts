import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build: ESM only, one output file per source module so consumers'
// bundlers can tree-shake unused components. React stays external.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
