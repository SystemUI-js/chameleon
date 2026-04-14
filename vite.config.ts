import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

type BuildFormat = 'es' | 'umd';

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

const resolveBuildFormat = (mode: string): BuildFormat => (mode === 'umd' ? 'umd' : 'es');

export default defineConfig(({ mode }) => {
  const format = resolveBuildFormat(mode);
  const isUmdBuild = format === 'umd';

  return {
    resolve: { alias },
    plugins: [
      react(isUmdBuild ? { jsxRuntime: 'classic' } : undefined),
      ...(isUmdBuild ? [] : [dtsPlugin]),
    ],
    server,
    build: {
      emptyOutDir: !isUmdBuild,
      lib: {
        entry: 'src/index.ts',
        name: 'Chameleon',
        fileName: () => (isUmdBuild ? 'chameleon.umd.cjs' : 'chameleon.es.js'),
        formats: [format],
      },
      rollupOptions: isUmdBuild
        ? {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
            },
          }
        : {
            external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
          },
    },
  };
});
