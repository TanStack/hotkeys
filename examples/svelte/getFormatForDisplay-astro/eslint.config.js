// @ts-check

import rootConfig from '../../../eslint.config.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'eslint.config.js',
      'svelte.config.js',
      'dist',
      '.astro',
      'src/**/*.svelte',
    ],
  },
  ...rootConfig,
]
