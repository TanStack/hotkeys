import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import UnsetOptionsHarness from './UnsetOptionsHarness.svelte'
import {
  createListWithNullish,
  createOptionalHotkey,
} from './unset-values-harness.svelte'

const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', bubbles: true }),
  )
const registrationCount = () => getHotkeyManager().registrations.state.size

beforeEach(() => HotkeyManager.resetInstance())
afterEach(() => HotkeyManager.resetInstance())

it('a hotkey that becomes undefined or null unregisters, and a value registers again', () => {
  const onRun = vi.fn()
  const { destroy, hint, set } = createOptionalHotkey(onRun)
  expect(registrationCount()).toBe(1)
  for (const unset of [undefined, null]) {
    set(unset)
    expect(registrationCount()).toBe(0)
    expect(hint.visible).toBe(false)
    press()
    expect(onRun).not.toHaveBeenCalled()
  }
  set('K')
  expect(registrationCount()).toBe(1)
  press()
  expect(onRun).toHaveBeenCalledOnce()
  destroy()
})

it('createHotkeys skips a nullish definition', () => {
  const destroy = createListWithNullish(['A', undefined, 'B'])
  expect(registrationCount()).toBe(2)
  destroy()
})

/** Presses Ctrl+S on the body and reports what happened to the event. */
function pressCtrlS() {
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
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

it('options forwarded as undefined keep their defaults', async () => {
  const component = mount(UnsetOptionsHarness, {
    target: document.body,
    props: {},
  })
  flushSync()
  expect(pressCtrlS()).toEqual({ defaultPrevented: true, reachedWindow: false })
  await unmount(component)
})

it('options forwarded as undefined keep the provider defaults', async () => {
  const component = mount(UnsetOptionsHarness, {
    target: document.body,
    props: { providerPreventDefault: false },
  })
  flushSync()
  expect(pressCtrlS().defaultPrevented).toBe(false)
  await unmount(component)
})
