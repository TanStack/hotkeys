import { afterEach, describe, expect, it, vi } from 'vitest'

type Library = typeof import('../src')

// Every console call in the library, each triggered once
const scenarios: Record<string, (library: Library) => void> = {
  'duplicate registration': ({ getHotkeyManager }) => {
    const manager = getHotkeyManager()
    manager.register('Mod+K', () => {})
    manager.register('Mod+K', () => {})
  },
  'checkHotkey errors': ({ checkHotkey }) => checkHotkey(''),
  'checkHotkey warnings': ({ checkHotkey }) =>
    checkHotkey('Control+someweirdkey'),
  'registering an unknown key': ({ getHotkeyManager }) =>
    getHotkeyManager().register('Control+escape' as never, () => {}),
  'repeated exclusive scope': ({ getHotkeyManager }) => {
    const manager = getHotkeyManager()
    manager.activateScope('dialog', { exclusive: true })
    manager.activateScope('dialog', { exclusive: true })
  },
}

const loaded: Array<Library> = []

/**
 * Loads a fresh copy of the library. It reads `process.env.NODE_ENV` once as
 * it loads, so each test sets up `process` first.
 */
async function load(): Promise<Library> {
  vi.resetModules()
  const library = await import('../src')
  loaded.push(library)
  return library
}

function countLogs(run: () => void): number {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  run()
  return warn.mock.calls.length + error.mock.calls.length
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  for (const library of loaded.splice(0)) library.HotkeyManager.resetInstance()
})

describe('console output', () => {
  it.each(Object.entries(scenarios))(
    'logs for %s in development',
    async (_, run) => {
      vi.stubEnv('NODE_ENV', 'development')
      const library = await load()
      expect(countLogs(() => run(library))).toBe(1)
    },
  )

  it.each(Object.entries(scenarios))(
    'is silent for %s in production',
    async (_, run) => {
      vi.stubEnv('NODE_ENV', 'production')
      const library = await load()
      expect(countLogs(() => run(library))).toBe(0)
    },
  )

  // Test runners and servers can set NODE_ENV after the library loads
  it.each(Object.entries(scenarios))(
    'is silent for %s once NODE_ENV becomes production',
    async (_, run) => {
      vi.stubEnv('NODE_ENV', 'development')
      const library = await load()
      vi.stubEnv('NODE_ENV', 'production')
      expect(countLogs(() => run(library))).toBe(0)
    },
  )

  // Plain ESM from a CDN has no bundler to replace process.env
  it.each(Object.entries(scenarios))(
    'is silent and does not throw for %s without process',
    async (_, run) => {
      vi.stubGlobal('process', undefined)
      const library = await load()
      expect(countLogs(() => run(library))).toBe(0)
    },
  )

  // Some browser shims define `process` without `env`
  it.each(Object.entries(scenarios))(
    'is silent and does not throw for %s when process has no env',
    async (_, run) => {
      vi.stubGlobal('process', {})
      const library = await load()
      expect(countLogs(() => run(library))).toBe(0)
    },
  )

  // A test setup that makes console calls throw still fails on a warning
  it.each(Object.entries(scenarios))(
    'lets an error from the console call for %s through',
    async (_, run) => {
      vi.stubEnv('NODE_ENV', 'development')
      const library = await load()
      const fail = () => {
        throw new Error('unexpected console call')
      }
      vi.spyOn(console, 'warn').mockImplementation(fail)
      vi.spyOn(console, 'error').mockImplementation(fail)
      expect(() => run(library)).toThrow('unexpected console call')
    },
  )

  // Every scope other than global reaches the exclusive-scope check
  it('activates a non-exclusive scope without process', async () => {
    vi.stubGlobal('process', undefined)
    const manager = (await load()).getHotkeyManager()
    expect(() => manager.activateScope('panel')).not.toThrow()
    expect(manager.isScopeActive('panel')).toBe(true)
  })

  it('still returns validity from checkHotkey in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { checkHotkey } = await load()
    expect(checkHotkey('')).toBe(false)
    expect(checkHotkey('Control+A')).toBe(true)
  })
})
