import { defineConfig } from 'vite'
import typescript2 from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: './src/index.ts',
      name: 'index',
      fileName: 'index'
    },
    sourcemap: true,
    outDir: 'build',
    rollupOptions: {
      external: [
        ...Object
          .keys(pkg.dependencies),
        'scannarr'
      ]
    }
  },
  plugins: [
    {
      ...typescript2({
        abortOnError: false
      }),
      apply: 'build'
    }
  ]
})
