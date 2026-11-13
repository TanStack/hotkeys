import { afterEach, expect, it, vi } from 'vitest'
import { managerRef } from '../src/_manager-ref'
import { findHotkeyConflicts } from '../src/conflicts'
import { HotkeyManager } from '../src/hotkey-manager'

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

it('checks conflicts without creating a manager', () => {
  HotkeyManager.resetInstance()
  expect(findHotkeyConflicts('Mod+S')).toEqual([])
  // Recorders reach the registry through this ref, not by importing the manager.
  expect(managerRef.current).toBeNull()
})
it('resolves aliases, disabled state and exclusions', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Control+S', vi.fn(), { platform: 'windows' })
  expect(manager.isRegistered('Mod+S')).toBe(true)
  expect(findHotkeyConflicts('Mod+S', { platform: 'windows' })).toHaveLength(1)
  expect(
    findHotkeyConflicts('Mod+S', {
      platform: 'windows',
      excludeIds: [handle.id],
    }),
  ).toEqual([])
  handle.setOptions({ enabled: false })
  expect(findHotkeyConflicts('Mod+S', { platform: 'windows' })).toEqual([])
  expect(
    findHotkeyConflicts('Mod+S', {
      platform: 'windows',
      includeDisabled: true,
    }),
  ).toHaveLength(1)
})
it('finds conflicts for a bracketed key that is not a code', () => {
  // '[1]' parses as the key '[1]'; parsing that result again would throw.
  const manager = HotkeyManager.getInstance()
  manager.register('Control+[1]' as never, vi.fn(), { platform: 'windows' })
  expect(
    findHotkeyConflicts('Control+[1]' as never, { platform: 'windows' }),
  ).toHaveLength(1)
})
it('allows disjoint targets and finds overlapping targets', () => {
  const a = document.createElement('div'),
    b = document.createElement('div'),
    child = document.createElement('div')
  a.append(child)
  document.body.append(a, b)
  HotkeyManager.getInstance().register('Alt+[KeyS]', vi.fn(), { target: a })
  expect(findHotkeyConflicts('Alt+[KeyS]', { target: b })).toEqual([])
  expect(findHotkeyConflicts('Alt+[KeyS]', { target: child })).toHaveLength(1)
  expect(findHotkeyConflicts('Alt+[KeyS]')).toHaveLength(1)
  expect(
    findHotkeyConflicts('Alt+[KeyS]', { target: b, scope: 'all' }),
  ).toHaveLength(1)
  expect(findHotkeyConflicts('Alt+[KeyS]', { eventType: 'keyup' })).toEqual([])
})
it('finds sequence prefix conflicts in both directions', () => {
  HotkeyManager.getInstance().register(['[KeyG]', '[KeyG]'], vi.fn())
  expect(findHotkeyConflicts('[KeyG]')).toHaveLength(1)
  expect(findHotkeyConflicts(['[KeyG]', '[KeyG]', '[KeyD]'])).toHaveLength(1)
  expect(findHotkeyConflicts(['[KeyG]', '[KeyD]'])).toEqual([])
  HotkeyManager.getInstance().register('[KeyX]', vi.fn())
  expect(findHotkeyConflicts(['[KeyX]', '[KeyD]'])).toHaveLength(1)
})
