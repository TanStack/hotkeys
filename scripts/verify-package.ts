import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

type ExportTarget = string | { [condition: string]: ExportTarget }

interface PackedManifest {
  name: string
  type?: string
  keywords?: Array<string>
  types: string
  main?: string
  engines: { node: string }
  files: Array<string>
  exports: Record<string, ExportTarget>
  dependencies?: Record<string, string>
  'ember-addon'?: { version: number; main: string }
}

const useClient = /^\s*['"]use client['"]/

// Validate an actual pnpm tarball, not the workspace where unpublished source
// files and stale build output can mask a broken release.
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hotkeys-package-'))

try {
  const archive = join(temporaryDirectory, 'package.tgz')
  execFileSync('pnpm', ['pack', '--out', archive], { stdio: 'pipe' })
  const files = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((file) => !file.endsWith('/'))
    .map((file) => file.replace(/^package\//, ''))

  execFileSync('tar', ['-xzf', archive, '-C', temporaryDirectory])
  const packageDirectory = join(temporaryDirectory, 'package')
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  ) as PackedManifest

  const emberAddon = manifest['ember-addon']?.version === 2
  if (emberAddon) {
    // ember-auto-import only treats packages with this keyword as v2 addons.
    assert.ok(
      manifest.keywords?.includes('ember-addon'),
      'Ember v2 addons need the ember-addon keyword',
    )
    // Classic builds break when webpack applies strict ESM interop to
    // `@ember/*` default imports, so v2 addons leave `type` unset.
    assert.equal(manifest.type, undefined, 'Ember v2 addons must not set type')
  } else {
    assert.equal(manifest.type, 'module', 'Packages must be ESM')
  }
  assert.equal(
    manifest.engines.node,
    manifest.name === '@tanstack/octane-hotkeys' ? '>=22.22.2' : '>=20',
  )
  assert.equal(manifest.types, './dist/index.d.ts')
  assert.equal(manifest.main, undefined, 'Do not restore a legacy main entry')
  // Packages that ship Intent skills list `skills` after the build output.
  const shipsSkills = manifest.files.at(-1) === 'skills'
  assert.deepEqual(manifest.files, [
    ...(emberAddon ? ['dist', 'addon-main.cjs'] : ['dist']),
    ...(shipsSkills ? ['skills'] : []),
  ])
  if (shipsSkills) {
    assert.ok(
      files.some((file) => /^skills\/[a-z0-9-]+\/SKILL\.md$/.test(file)),
      'The skills entry must publish at least one SKILL.md',
    )
  }
  assert.ok(manifest.exports['.'], 'The package must export its main entry')

  function checkFile(target: string) {
    const file = target.replace(/^\.\//, '')
    assert.ok(files.includes(file), `Missing packed export: ${target}`)
  }

  function checkExport(target: ExportTarget) {
    if (typeof target === 'string') {
      checkFile(target)
      if (target.endsWith('.js')) {
        checkFile(target.replace(/\.js$/, '.d.ts'))
      }
      return
    }
    assert.ok(
      !('require' in target),
      'CommonJS export conditions are forbidden',
    )
    for (const value of Object.values(target)) checkExport(value)
  }

  checkFile(manifest.types)
  for (const target of Object.values(manifest.exports)) checkExport(target)
  for (const version of Object.values(manifest.dependencies ?? {})) {
    assert.ok(
      !version.startsWith('workspace:'),
      'Unresolved workspace dependency',
    )
  }

  let unpackedBytes = 0
  for (const file of files) {
    assert.ok(
      (emberAddon && file === 'addon-main.cjs') ||
        file.startsWith('dist/') ||
        /^skills\/[a-z0-9-]+\/(?:SKILL|references\/[a-z0-9-]+)\.md$/.test(
          file,
        ) ||
        /^(package\.json|readme(?:\..*)?|licen[cs]e(?:\..*)?|changelog(?:\..*)?)$/i.test(
          file,
        ),
      `Unexpected published file: ${file}`,
    )
    assert.ok(!/(^|\/)src\//.test(file), `Published source directory: ${file}`)
    assert.ok(
      (emberAddon && file === 'addon-main.cjs') ||
        !/\.(?:cjs|cts|map)$/.test(file),
      `Legacy output or map: ${file}`,
    )
    assert.ok(
      !/\.[cm]?tsx?$/.test(file) || file.endsWith('.d.ts'),
      `Uncompiled TypeScript: ${file}`,
    )
    const path = join(packageDirectory, file)
    unpackedBytes += statSync(path).size
    // React Server Components need 'use client' at the top of each built file
    // whose source declares it.
    const source = /^dist\/(.+)\.js$/.exec(file)?.[1]
    const sourceFile = source
      ? [`src/${source}.ts`, `src/${source}.tsx`].find((candidate) =>
          existsSync(candidate),
        )
      : undefined
    if (sourceFile && useClient.test(readFileSync(sourceFile, 'utf8'))) {
      assert.ok(
        useClient.test(readFileSync(path, 'utf8')),
        `Lost 'use client' directive: ${file}`,
      )
    }
    if (/\.(?:js|ts|svelte|css)$/.test(file)) {
      assert.ok(
        !/sourceMappingURL\s*=/.test(readFileSync(path, 'utf8')),
        `Published source map reference: ${file}`,
      )
    }
  }

  console.log(
    `${manifest.name}: verified ${files.length} packed files, ${statSync(archive).size} compressed bytes, ${unpackedBytes} unpacked bytes`,
  )
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true })
}
