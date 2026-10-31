// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { createHotkey } from '../src/createHotkey'
import { createHotkeyHint } from '../src/createHotkeyHint'
import { createHotkeys } from '../src/createHotkeys'
import type { Hotkey } from '@tanstack/hotkeys'
import type { Component } from 'solid-js'

const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )
const registrationCount = () => getHotkeyManager().registrations.state.size

beforeEach(() => HotkeyManager.resetInstance())
afterEach(() => HotkeyManager.resetInstance())

it('a hotkey that becomes undefined or null unregisters, and a value registers again', () => {
  const [shortcut, setShortcut] = createSignal<Hotkey | null | undefined>('K')
  const onRun = vi.fn()
  let hint: () => boolean = () => true
  const { unmount } = render(() => {
    createHotkey(shortcut, onRun)
    hint = createHotkeyHint(shortcut)
    return null
  })
  expect(registrationCount()).toBe(1)
  for (const unset of [undefined, null]) {
    setShortcut(unset)
    expect(registrationCount()).toBe(0)
    expect(hint()).toBe(false)
    press()
    expect(onRun).not.toHaveBeenCalled()
  }
  setShortcut('K')
  expect(registrationCount()).toBe(1)
  press()
  expect(onRun).toHaveBeenCalledOnce()
  unmount()
})

it('createHotkeys skips a nullish definition', () => {
  const shortcuts: Array<Hotkey | undefined> = ['A', undefined, 'B']
  const { unmount } = render(() => {
    createHotkeys(shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })))
    return null
  })
  expect(registrationCount()).toBe(2)
  unmount()
})

it('keeps the defaults when getter options forward unset props', () => {
  const onRun = vi.fn()
  const Shortcut: Component<{
    preventDefault?: boolean
    stopPropagation?: boolean
  }> = (props) => {
    createHotkey('Mod+S', onRun, {
      platform: 'windows',
      get preventDefault() {
        return props.preventDefault
      },
      get stopPropagation() {
        return props.stopPropagation
      },
    })
    return null
  }
  render(() => <Shortcut />)

  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  document.body.dispatchEvent(event)
  window.removeEventListener('keydown', listener)

  expect(onRun).toHaveBeenCalledOnce()
  expect(event.defaultPrevented).toBe(true)
  expect(reachedWindow).toBe(false)
})
