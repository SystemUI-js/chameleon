import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json'
    })
  ],
  server: {
    port: 5673
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Chameleon',
      fileName: (format) =>
        format === 'es' ? 'chameleon.es.js' : 'chameleon.umd.cjs',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
