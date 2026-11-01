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
  // The adapter entry imports the main entry by package name, so CDNs that
  // bundle each entry on their own still share one manager.
  deps: { onlyBundle: ['@tanstack/store'], neverBundle: ['@tanstack/hotkeys'] },
  outputOptions: {
    entryFileNames: ({ name }) =>
      `${name.replace(/^node_modules\/.*\/node_modules\//, 'vendor/')}.js`,
  },
  publint: {
    strict: true,
  },
})
