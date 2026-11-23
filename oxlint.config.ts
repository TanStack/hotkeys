import pluginReact from '@eslint-react/eslint-plugin'
import { tanstackConfig } from '@tanstack/oxlint-config'
import { defineConfig } from 'oxlint'
import type { DummyRuleMap, OxlintConfig } from 'oxlint'

/** `@eslint-react` recommended, minus the hooks rules Oxlint runs natively */
const eslintReactRules = Object.fromEntries(
  Object.entries(pluginReact.configs.recommended.rules ?? {}).filter(
    ([name]) =>
      name !== '@eslint-react/rules-of-hooks' &&
      name !== '@eslint-react/exhaustive-deps',
  ),
) as DummyRuleMap

const config: OxlintConfig = defineConfig({
  extends: [tanstackConfig],
  // Not inherited through `extends`
  env: tanstackConfig.env,
  ignorePatterns: [...tanstackConfig.ignorePatterns, '**/*.gen.ts'],
  rules: {
    'no-case-declarations': 'off',
    'no-shadow': 'off',
  },
  overrides: [
    {
      files: [
        'packages/react-hotkeys/**',
        'packages/react-hotkeys-devtools/**',
      ],
      plugins: ['react'],
      jsPlugins: [
        '@eslint-react/eslint-plugin',
        'eslint-plugin-react-compiler',
      ],
      rules: {
        ...eslintReactRules,
        'react-compiler/react-compiler': 'error',
        'react/rules-of-hooks': 'error',
        'react/exhaustive-deps': 'error',
      },
    },
  ],
})

export default config
