import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src'],
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  server: {
    port: 5673,
    host: '0.0.0.0',
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'react-native-multi-drag': 'src/react-native-multi-drag/index.ts',
        'legacy-web': 'src/legacy-web.ts',
      },
      fileName: (format, entryName) => {
        const suffix = format === 'es' ? 'es.js' : 'cjs';

        if (entryName === 'index') {
          return `chameleon.${suffix}`;
        }

        return `${entryName}.${suffix}`;
      },
      formats: ['es', 'cjs'],
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
});
