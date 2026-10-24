// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import React from 'react'
import {
  HotkeyManager,
  KeyStateTracker,
  defineAppHotkeys,
} from '@tanstack/hotkeys'
import { HotkeysProvider, useHotkey, useHotkeyHint } from '../src'
import type { ReactNode } from 'react'

function key(
  type: string,
  key: string,
  code: string,
  flags: KeyboardEventInit = {},
) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent(type, { key, code, bubbles: true, ...flags }),
    )
  })
}
afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('selects hint visibility without rerendering on unrelated keys and clears on blur', () => {
  const renders = vi.fn()
  const { result, rerender } = renderHook(
    ({ binding }) => {
      renders()
      useHotkey(binding, () => {}, { platform: 'mac' })
      return useHotkeyHint(binding, { platform: 'mac' })
    },
    {
      initialProps: {
        binding:
          'Alt+Shift+[KeyS]' as const as import('@tanstack/hotkeys').Hotkey,
      },
    },
  )
  expect(result.current).toBe(false)
  key('keydown', 'Alt', 'AltLeft', { altKey: true })
  expect(result.current).toBe(true)
  const count = renders.mock.calls.length
  key('keydown', 'x', 'KeyX', { altKey: true })
  expect(renders).toHaveBeenCalledTimes(count)
  rerender({ binding: 'Control+[KeyS]' })
  expect(result.current).toBe(false)
  rerender({ binding: 'Alt+Shift+[KeyS]' })
  expect(result.current).toBe(true)
  act(() => {
    window.dispatchEvent(new Event('blur'))
  })
  expect(result.current).toBe(false)
})
it('hides hints for hotkeys that cannot fire', () => {
  const appHotkeys = defineAppHotkeys({
    'doc.edit': { hotkey: 'Alt+E', scope: 'page' },
    'doc.delete': { hotkey: 'Alt+D' },
    'doc.unused': { hotkey: 'Alt+U' },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider appHotkeys={appHotkeys}>{children}</HotkeysProvider>
  )
  const { result, rerender } = renderHook(
    ({ enabled }) => {
      useHotkey(appHotkeys['doc.edit'], () => {})
      useHotkey(appHotkeys['doc.delete'], () => {}, { enabled })
      useHotkey('Alt+P', () => {}, { enabled })
      return {
        edit: useHotkeyHint(appHotkeys['doc.edit']),
        delete: useHotkeyHint(appHotkeys['doc.delete']),
        unused: useHotkeyHint(appHotkeys['doc.unused']),
        plain: useHotkeyHint('Alt+P'),
        unregistered: useHotkeyHint('Alt+Q'),
      }
    },
    { wrapper, initialProps: { enabled: false } },
  )
  const manager = HotkeyManager.getInstance()
  let releasePage!: () => void
  act(() => {
    releasePage = manager.activateScope('page')
  })
  key('keydown', 'Alt', 'AltLeft', { altKey: true })
  expect(result.current).toEqual({
    edit: true,
    delete: false,
    unused: false,
    plain: false,
    unregistered: false,
  })

  rerender({ enabled: true })
  expect(result.current.delete).toBe(true)
  expect(result.current.plain).toBe(true)

  // An exclusive scope suspends 'page' and 'global'.
  let releaseDialog!: () => void
  act(() => {
    releaseDialog = manager.activateScope('dialog', { exclusive: true })
  })
  expect(result.current).toMatchObject({
    edit: false,
    delete: false,
    plain: false,
  })

  act(() => releaseDialog())
  expect(result.current.edit).toBe(true)
  act(() => releasePage())
  expect(result.current.edit).toBe(false)
})
it('shows hints for element hotkeys only while focus is inside the element', () => {
  const panel = document.createElement('div')
  const input = document.createElement('input')
  const outside = document.createElement('button')
  panel.appendChild(input)
  document.body.append(panel, outside)
  const { result } = renderHook(() => {
    useHotkey('Alt+P', () => {}, { target: panel })
    return useHotkeyHint('Alt+P')
  })

  outside.focus()
  key('keydown', 'Alt', 'AltLeft', { altKey: true })
  expect(result.current).toBe(false)
  key('keyup', 'Alt', 'AltLeft')

  input.focus()
  key('keydown', 'Alt', 'AltLeft', { altKey: true })
  expect(result.current).toBe(true)

  panel.remove()
  outside.remove()
})
it('preserves raw code bindings through hook normalization and sequence registration', () => {
  const single = vi.fn(),
    sequence = vi.fn()
  const { unmount } = renderHook(() => {
    useHotkey({ code: 'KeyQ', shift: true }, single)
    useHotkey(['Shift+[KeyQ]', '[NumpadEnter]'], sequence)
  })
  key('keydown', 'A', 'KeyQ', { shiftKey: true })
  key('keyup', 'a', 'KeyQ')
  key('keydown', 'Enter', 'NumpadEnter')
  expect(single).toHaveBeenCalledOnce()
  expect(sequence).toHaveBeenCalledOnce()
  unmount()
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
})
it('moves an unchanged binding to a new target after commit', () => {
  const a = document.createElement('div'),
    b = document.createElement('div'),
    callback = vi.fn()
  document.body.append(a, b)
  const { rerender, unmount } = renderHook(
    ({ target }) => useHotkey('[KeyQ]', callback, { target }),
    { initialProps: { target: a } },
  )
  rerender({ target: b })
  act(() => {
    a.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }),
    )
  })
  expect(callback).not.toHaveBeenCalled()
  act(() => {
    b.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }),
    )
  })
  expect(callback).toHaveBeenCalledOnce()
  unmount()
  a.remove()
  b.remove()
})
