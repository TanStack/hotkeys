import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/typedoc-config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await generateReferenceDocs({
  packages: [
    {
      name: 'hotkeys',
      entryPoints: [resolve(__dirname, '../packages/hotkeys/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/hotkeys/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/reference'),
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
  ],
})

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
