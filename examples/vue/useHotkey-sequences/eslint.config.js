// @ts-check

import rootConfig from '../../../eslint.config.js'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const configDir = import.meta.dirname

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['eslint.config.js', 'vite.config.ts'],
  },
  ...rootConfig,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        project: './tsconfig.json',
        tsconfigRootDir: configDir,
      },
    },
  },
]
