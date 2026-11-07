import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, checkHotkey, getHotkeyManager } from '../src'

// Every console call in the library, each triggered once
const scenarios: Record<string, () => void> = {
  'duplicate registration': () => {
    const manager = getHotkeyManager()
    manager.register('Mod+K', () => {})
    manager.register('Mod+K', () => {})
  },
  'checkHotkey errors': () => checkHotkey(''),
  'checkHotkey warnings': () => checkHotkey('Control+someweirdkey'),
  'registering an unknown key': () =>
    getHotkeyManager().register('Control+escape' as never, () => {}),
  'repeated exclusive scope': () => {
    const manager = getHotkeyManager()
    manager.activateScope('dialog', { exclusive: true })
    manager.activateScope('dialog', { exclusive: true })
  },
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
  HotkeyManager.resetInstance()
})

describe('console output', () => {
  it.each(Object.entries(scenarios))('logs for %s in development', (_, run) => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(countLogs(run)).toBe(1)
  })

  it.each(Object.entries(scenarios))(
    'is silent for %s in production',
    (_, run) => {
      vi.stubEnv('NODE_ENV', 'production')
      expect(countLogs(run)).toBe(0)
    },
  )

  // Plain ESM from a CDN has no bundler to replace process.env
  it.each(Object.entries(scenarios))(
    'does not throw for %s without process',
    (_, run) => {
      vi.stubGlobal('process', undefined)
      expect(() => countLogs(run)).not.toThrow()
    },
  )

  it('still returns validity from checkHotkey in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(checkHotkey('')).toBe(false)
    expect(checkHotkey('Control+A')).toBe(true)
  })
})
