import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeys } from '../src/useHotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import type { Hotkey } from '@tanstack/hotkeys'

const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )
const registrationCount = () => getHotkeyManager().registrations.state.size

afterEach(() => HotkeyManager.resetInstance())

it('a hotkey that becomes undefined or null unregisters, and a value registers again', async () => {
  const shortcut = ref<Hotkey | null | undefined>('K')
  const onRun = vi.fn()
  let hint: { value: boolean } | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        useHotkey(shortcut, onRun)
        hint = useHotkeyHint(shortcut)
        return () => h('div')
      },
    }),
  )
  expect(registrationCount()).toBe(1)
  for (const unset of [undefined, null]) {
    shortcut.value = unset
    await nextTick()
    expect(registrationCount()).toBe(0)
    expect(hint!.value).toBe(false)
    press()
    expect(onRun).not.toHaveBeenCalled()
  }
  shortcut.value = 'K'
  await nextTick()
  expect(registrationCount()).toBe(1)
  press()
  expect(onRun).toHaveBeenCalledOnce()
  wrapper.unmount()
})

it('useHotkeys skips a nullish definition', () => {
  const shortcuts: Array<Hotkey | undefined> = ['A', undefined, 'B']
  const wrapper = mount(
    defineComponent({
      setup() {
        useHotkeys(shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })))
        return () => h('div')
      },
    }),
  )
  expect(registrationCount()).toBe(2)
  wrapper.unmount()
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

const Shortcut = defineComponent({
  props: {
    preventDefault: { type: Boolean, default: undefined },
    stopPropagation: { type: Boolean, default: undefined },
  },
  setup(props) {
    useHotkey(
      'Control+S',
      () => {},
      () => ({
        platform: 'windows',
        preventDefault: props.preventDefault,
        stopPropagation: props.stopPropagation,
      }),
    )
    return () => h('div')
  },
})

it('options forwarded as undefined keep their defaults', () => {
  const wrapper = mount(Shortcut)
  expect(pressCtrlS()).toEqual({ defaultPrevented: true, reachedWindow: false })
  wrapper.unmount()
})

it('options forwarded as undefined keep the provider defaults', () => {
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            HotkeysProvider,
            { defaultOptions: { hotkey: { preventDefault: false } } },
            { default: () => h(Shortcut) },
          )
      },
    }),
  )
  expect(pressCtrlS().defaultPrevented).toBe(false)
  wrapper.unmount()
})
