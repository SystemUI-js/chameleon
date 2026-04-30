import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...(command === 'serve'
        ? {
            'react-native': fileURLToPath(
              new URL('./src/runtime/react-native-web.tsx', import.meta.url),
            ),
          }
        : {}),
    },
  },
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  server: {
    port: 5673,
    host: '0.0.0.0',
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Chameleon',
      fileName: (format) => (format === 'es' ? 'chameleon.es.js' : 'chameleon.umd.cjs'),
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-native'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-native': 'ReactNative',
        },
      },
    },
  },
}));
