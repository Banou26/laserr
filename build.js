import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './build/index.js',
  watch: process.argv.includes('-w') || process.argv.includes('--watch'),
  format: 'esm',
  bundle: true,
  publicPath: '/',
  sourcemap: true,
  minify: process.argv.includes('-m') || process.argv.includes('--minify'),
  external: ['./node_modules/*', '../scannarr/node_modules/*']
})
