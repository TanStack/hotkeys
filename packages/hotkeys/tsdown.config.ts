import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/adapter.ts'],
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: true,
  // Types picked from @tanstack/store, a devDependency, are inlined. npm never
  // publishes node_modules folders, so emit them under dist/vendor instead.
  deps: { onlyBundle: ['@tanstack/store'] },
  outputOptions: {
    entryFileNames: ({ name }) =>
      `${name.replace(/^node_modules\/.*\/node_modules\//, 'vendor/')}.js`,
  },
  publint: {
    strict: true,
  },
})
