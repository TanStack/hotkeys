// @ts-check

import rootConfig from '../../../eslint.config.js'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const configDir = import.meta.dirname

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['eslint.config.js', '.nuxt', '.output', '.data'],
  },
  ...rootConfig,
  // tsconfig.json references the projects that `nuxt prepare` generates
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parserOptions: {
        project: null,
        projectService: true,
        tsconfigRootDir: configDir,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        project: null,
        projectService: true,
        tsconfigRootDir: configDir,
      },
    },
  },
]
