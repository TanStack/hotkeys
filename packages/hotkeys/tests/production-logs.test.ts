import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AppHotkeysStore,
  HotkeyManager,
  checkHotkey,
  defineAppHotkeys,
  getHotkeyManager,
} from '../src'

const appHotkeys = defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } })

// Every console call in the library, each triggered once
const scenarios: Record<string, () => void> = {
  'duplicate registration': () => {
    const manager = getHotkeyManager()
    manager.register('Mod+K', () => {})
    manager.register('Mod+K', () => {})
  },
  'checkHotkey errors': () => checkHotkey(''),
  'checkHotkey warnings': () => checkHotkey('Control+SomeWeirdKey'),
  'repeated exclusive scope': () => {
    const manager = getHotkeyManager()
    manager.activateScope('dialog', { exclusive: true })
    manager.activateScope('dialog', { exclusive: true })
  },
  'custom hotkey for an unknown id': () =>
    new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.missing': 'Mod+M' } as never,
    }),
  'invalid custom hotkey': () =>
    new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 42 } as never,
    }),
  'setCustomHotkey for an unknown id': () =>
    new AppHotkeysStore(appHotkeys).setCustomHotkey(
      'doc.missing' as never,
      'Mod+M',
    ),
}

function countLogs(run: () => void): number {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  run()
  return warn.mock.calls.length + error.mock.calls.length
}

afterEach(() => {
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

  it('still returns validity from checkHotkey in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(checkHotkey('')).toBe(false)
    expect(checkHotkey('Control+A')).toBe(true)
  })
})
