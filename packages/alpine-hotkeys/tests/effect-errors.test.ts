import Alpine from 'alpinejs'
import { afterEach, expect, it, vi } from 'vitest'
import { HotkeyManager, createHotkeysScope, getHotkeyManager } from '../src'
import type { Hotkey } from '../src'

const scopes: Array<ReturnType<typeof createHotkeysScope>> = []
function scope() {
  const value = createHotkeysScope()
  scopes.push(value)
  return value
}
const press = (key: string) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))

afterEach(() => {
  scopes.splice(0).forEach((value) => value.destroy())
  HotkeyManager.resetInstance()
  vi.unstubAllGlobals()
})

it('reports a conflicting rebind and keeps other Alpine effects running', async () => {
  const reportError = vi.fn()
  vi.stubGlobal('reportError', reportError)
  getHotkeyManager().register('B', () => {})
  const hotkeys = scope()
  const state = Alpine.reactive({ hotkey: 'A' as Hotkey, label: 'a' })
  const callback = vi.fn()
  hotkeys.createHotkey(() => state.hotkey, callback, {
    conflictBehavior: 'error',
  })
  let label = ''
  const runner = Alpine.effect(() => {
    label = state.label
  })

  state.hotkey = 'B'
  await Alpine.nextTick()
  expect(reportError).toHaveBeenCalledOnce()
  expect(reportError.mock.calls[0]![0]).toBeInstanceOf(Error)

  // The sibling effect still runs.
  state.label = 'b'
  await Alpine.nextTick()
  expect(label).toBe('b')

  // A free key registers again.
  state.hotkey = 'C'
  await Alpine.nextTick()
  press('c')
  expect(callback).toHaveBeenCalledOnce()
  Alpine.release(runner)
})

it('throws a first-run conflict to the caller', () => {
  getHotkeyManager().register('B', () => {})
  expect(() =>
    scope().createHotkey('B', () => {}, { conflictBehavior: 'error' }),
  ).toThrow(/already registered/)
})

it('releases a hotkey whose first run failed', async () => {
  getHotkeyManager().register('B', () => {})
  const state = Alpine.reactive({ hotkey: 'B' as Hotkey })
  const callback = vi.fn()
  expect(() =>
    scope().createHotkey(() => state.hotkey, callback, {
      conflictBehavior: 'error',
    }),
  ).toThrow(/already registered/)

  // The failed call has no effect left to re-run.
  state.hotkey = 'C'
  await Alpine.nextTick()
  press('c')
  expect(callback).not.toHaveBeenCalled()
})
