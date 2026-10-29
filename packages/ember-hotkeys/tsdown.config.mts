import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  deps: { neverBundle: [/^@ember\//] },
  exports: false,
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  // Like the official v2 addon blueprint, the package has no "type": "module".
  // With it, webpack in classic (ember-auto-import) builds imports the whole
  // module object for default imports such as `@ember/component/helper`.
  // Pin `.js` output, which tsdown would otherwise write as `.mjs`.
  fixedExtension: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  // publint warns that ESM `.js` files in a typeless package look like
  // CommonJS to Node. Only bundlers load this addon, so report errors only.
  publint: {
    level: 'error',
  },
})
