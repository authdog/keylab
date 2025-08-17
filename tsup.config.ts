import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  sourcemap: false,
  target: 'es2020',
  outDir: 'dist',
  esbuildOptions: (options) => {
    options.keepNames = false
    options.minifyIdentifiers = true
    options.minifySyntax = true
    options.minifyWhitespace = true
    options.treeShaking = true
    options.ignoreAnnotations = true
    options.legalComments = 'none'
    options.define = {
      'process.env.NODE_ENV': '"production"'
    }
  },
  banner: {
    js: '',
  },
  footer: {
    js: '',
  },
})
