import { afterEach, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { HotkeyManager } from '@tanstack/hotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import React from 'react'
import type { RegisterableHotkey } from '@tanstack/hotkeys'
import type { ReactNode } from 'react'

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

it.each([
  ['chord', 'Control+S', ['s']],
  ['sequence', ['Control+S', 'Control+G'], ['s', 'g']],
] as const)(
  'forwards provider capture defaults and reactive overrides for a %s',
  (_kind, hotkey, keys) => {
    const callback = vi.fn()
    const child = document.createElement('button')
    document.body.append(child)
    child.addEventListener('keydown', (event) => event.stopPropagation())
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HotkeysProvider defaultOptions={{ hotkey: { capture: true } }}>
        {children}
      </HotkeysProvider>
    )
    const { rerender, unmount } = renderHook(
      ({ capture }: { capture?: boolean }) => {
        useHotkey(
          hotkey as RegisterableHotkey,
          callback,
          capture === undefined ? {} : { capture },
        )
      },
      { initialProps: { capture: undefined as boolean | undefined }, wrapper },
    )
    const manager = HotkeyManager.getInstance()
    const id = [...manager.registrations.state.keys()][0]!
    const press = () =>
      act(() => {
        for (const key of keys) {
          child.dispatchEvent(
            new KeyboardEvent('keydown', {
              key,
              ctrlKey: true,
              bubbles: true,
            }),
          )
        }
      })
    press()
    expect(callback).toHaveBeenCalledOnce()
    rerender({ capture: false })
    press()
    expect(callback).toHaveBeenCalledOnce()
    rerender({ capture: true })
    press()
    expect(callback).toHaveBeenCalledTimes(2)
    expect([...manager.registrations.state.keys()]).toEqual([id])
    expect(manager.registrations.state.get(id)?.triggerCount).toBe(2)
    unmount()
    expect(manager.getRegistrationCount()).toBe(0)
  },
)
