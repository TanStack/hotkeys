// @ts-check

import rootConfig from '../../../eslint.config.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['eslint.config.js', '.next', 'next-env.d.ts'],
  },
  ...rootConfig,
]
