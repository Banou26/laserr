
import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './src/build/index.js',
  watch: process.argv.includes('-w') || process.argv.includes('--watch'),
  format: 'esm',
  platform: 'node',
  bundle: true,
  publicPath: '/',
  sourcemap: true,
  minify: process.argv.includes('-m') || process.argv.includes('--minify'),
  external: ['node:test', 'assert', 'jsdom', 'canvas'],
  inject: ['./src/shim.ts']
})
