import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
};

const server = {
  port: 5673,
  host: '0.0.0.0',
};

const dtsPlugin = dts({
  entryRoot: 'src',
  outDir: 'dist',
  insertTypesEntry: true,
  tsconfigPath: './tsconfig.json',
});

export default defineConfig([
  {
    resolve: { alias },
    plugins: [react(), dtsPlugin],
    server,
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'Chameleon',
        fileName: () => 'chameleon.es.js',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
      },
    },
  },
  {
    resolve: { alias },
    plugins: [react({ jsxRuntime: 'classic' })],
    server,
    build: {
      emptyOutDir: false,
      lib: {
        entry: 'src/index.ts',
        name: 'Chameleon',
        fileName: () => 'chameleon.umd.cjs',
        formats: ['umd'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
  },
]);
