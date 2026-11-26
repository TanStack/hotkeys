// Runs the Ember adapter in a classic ember-cli app on an older Ember, to guard
// the `ember-source` peer range. The package's own tests need a recent Ember,
// so this generates an app with the given ember-cli version, copies in the
// probe from `e2e/ember-compat`, installs the packed core and adapter, and
// runs `ember test`. Build both packages first, or run the root script.
//
// Usage: node scripts/ember-compat.ts <ember-cli version> [ember-source version]
// The browser is Chrome, or `TESTEM_BROWSER`, such as `Headless Edge`.
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const [cliVersion, sourceVersion] = process.argv.slice(2)
if (!cliVersion) {
  console.error(
    'Usage: node scripts/ember-compat.ts <ember-cli version> [ember-source version]',
  )
  process.exit(1)
}

const rootDir = fileURLToPath(new URL('../..', import.meta.url))
const probeDir = fileURLToPath(new URL('../ember-compat', import.meta.url))
const workDir = mkdtempSync(join(tmpdir(), 'hotkeys-ember-compat-'))
const packsDir = join(workDir, 'packs')
const appDir = join(workDir, 'probe')

const run = (command: string, args: Array<string>, cwd: string) =>
  execFileSync(command, args, { cwd, stdio: 'inherit' })

for (const pkg of ['hotkeys', 'ember-hotkeys']) {
  run(
    'pnpm',
    ['pack', '--pack-destination', packsDir],
    join(rootDir, 'packages', pkg),
  )
}
const tarball = (prefix: string) => {
  const name = readdirSync(packsDir).find((file) =>
    new RegExp(`^${prefix}-\\d`).test(file),
  )
  if (!name) throw new Error(`No ${prefix} tarball in ${packsDir}`)
  return `file:${join(packsDir, name)}`
}

run(
  'npx',
  [
    '--yes',
    `ember-cli@${cliVersion}`,
    'new',
    'probe',
    '--skip-git',
    '--skip-npm',
    '--lang',
    'en',
  ],
  workDir,
)
cpSync(join(probeDir, 'app'), join(appDir, 'app'), { recursive: true })
cpSync(join(probeDir, 'tests'), join(appDir, 'tests'), { recursive: true })

const manifestPath = join(appDir, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.devDependencies['@tanstack/ember-hotkeys'] = tarball(
  'tanstack-ember-hotkeys',
)
if (sourceVersion) manifest.devDependencies['ember-source'] = sourceVersion
// The adapter depends on the exact core version, which may not be published.
manifest.overrides = { '@tanstack/hotkeys': tarball('tanstack-hotkeys') }
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

const browser = process.env.TESTEM_BROWSER ?? 'Chrome'
writeFileSync(
  join(appDir, 'testem.js'),
  `module.exports = ${JSON.stringify(
    {
      test_page: 'tests/index.html?hidepassed',
      disable_watching: true,
      launch_in_ci: [browser],
      browser_start_timeout: 120,
      browser_args: {
        Chrome: {
          ci: [
            '--headless',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--mute-audio',
            '--remote-debugging-port=0',
          ],
        },
      },
    },
    null,
    2,
  )}\n`,
)

run('npm', ['install', '--no-audit', '--no-fund'], appDir)
run('npx', ['ember', 'test', '--test-port', '0'], appDir)
