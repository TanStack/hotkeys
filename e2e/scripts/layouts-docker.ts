// Runs the keyboard layout tests with browsers in Docker, for macOS and
// Windows hosts. Test code runs here; browsers, the X display and xdotool run
// in the container. Extra arguments go to `playwright test`.
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const IMAGE = 'tanstack-hotkeys-e2e-x11'
const CONTAINER = `tanstack-hotkeys-e2e-x11-${process.pid}`
const PORT = process.env.E2E_PORT ?? '3939'
const e2eDir = fileURLToPath(new URL('..', import.meta.url))
const dockerDir = fileURLToPath(new URL('../docker', import.meta.url))

const docker = (...args: Array<string>) =>
  execFileSync('docker', args, { stdio: 'inherit' })

docker('build', '--quiet', '--tag', IMAGE, dockerDir)
docker(
  'run',
  '--detach',
  '--rm',
  '--init',
  '--ipc=host',
  '--name',
  CONTAINER,
  '--publish',
  `127.0.0.1:${PORT}:3000`,
  IMAGE,
)

let status = 1
try {
  await waitForServer()
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'playwright',
      'test',
      '--config',
      'playwright.layouts.config.ts',
      ...process.argv.slice(2),
    ],
    {
      cwd: e2eDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        E2E_X11_CONTAINER: CONTAINER,
        E2E_WS_ENDPOINT: `ws://127.0.0.1:${PORT}/`,
      },
    },
  )
  status = result.status ?? 1
} finally {
  spawnSync('docker', ['stop', '--time', '1', CONTAINER], { stdio: 'ignore' })
}
process.exit(status)

/** Waits until the browser server inside the container accepts requests. */
async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/`)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error('Browser server in Docker did not start within 60s')
}
