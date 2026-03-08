import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/typedoc-config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await generateReferenceDocs({
  packages: [
    {
      name: 'angular-hotkeys',
      entryPoints: [
        resolve(__dirname, '../packages/angular-hotkeys/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/angular-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/angular/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
    {
      name: 'hotkeys',
      entryPoints: [resolve(__dirname, '../packages/hotkeys/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/hotkeys/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/reference'),
    },
    {
      name: 'preact-hotkeys',
      entryPoints: [
        resolve(__dirname, '../packages/preact-hotkeys/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/preact-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/preact/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
    {
      name: 'react-hotkeys',
      entryPoints: [
        resolve(__dirname, '../packages/react-hotkeys/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/react-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/react/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
    {
      name: 'solid-hotkeys',
      entryPoints: [
        resolve(__dirname, '../packages/solid-hotkeys/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/solid-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/solid/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
    {
      name: 'vue-hotkeys',
      entryPoints: [resolve(__dirname, '../packages/vue-hotkeys/src/index.ts')],
      tsconfig: resolve(
        __dirname,
        '../packages/vue-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/vue/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
    {
      name: 'svelte-hotkeys',
      entryPoints: [
        resolve(__dirname, '../packages/svelte-hotkeys/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/svelte-hotkeys/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/svelte/reference'),
      exclude: ['packages/hotkeys/**/*'],
    },
  ],
})

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
