// @ts-check

import rootConfig from '../eslint.config.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...rootConfig,
  { ignores: ['.cache', 'test-results', 'playwright-report'] },
]
