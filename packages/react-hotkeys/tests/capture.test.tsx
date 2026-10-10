import { afterEach, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import { useHotkeySequence } from '../src/useHotkeySequence'
import React from 'react'
import type { ReactNode } from 'react'

afterEach(() => {
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  document.body.replaceChildren()
})

it.each(['hotkey', 'sequence'] as const)(
  'forwards provider capture defaults and reactive overrides for %s',
  (kind) => {
    const callback = vi.fn()
    const child = document.createElement('button')
    document.body.append(child)
    child.addEventListener('keydown', (event) => event.stopPropagation())
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HotkeysProvider
        defaultOptions={{
          hotkey: { capture: true },
          hotkeySequence: { capture: true },
        }}
      >
        {children}
      </HotkeysProvider>
    )
    const { rerender, unmount } = renderHook(
      ({ capture }: { capture?: boolean }) => {
        useHotkey('Control+S', callback, {
          ...(capture === undefined ? {} : { capture }),
          enabled: kind === 'hotkey',
        })
        useHotkeySequence(['Control+S'], callback, {
          ...(capture === undefined ? {} : { capture }),
          enabled: kind === 'sequence',
        })
      },
      { initialProps: { capture: undefined as boolean | undefined }, wrapper },
    )
    const manager =
      kind === 'hotkey'
        ? HotkeyManager.getInstance()
        : SequenceManager.getInstance()
    const id = [...manager.registrations.state.keys()][0]!
    const press = () =>
      act(() => {
        child.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
          }),
        )
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
