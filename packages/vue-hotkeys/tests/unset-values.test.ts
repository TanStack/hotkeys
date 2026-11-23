import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import {
  Fragment,
  defineComponent,
  h,
  nextTick,
  ref,
  useTemplateRef,
} from 'vue'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeys } from '../src/useHotkeys'
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

const pressIn = (target: EventTarget) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )
const registeredTargets = () =>
  [...getHotkeyManager().registrations.state.values()].map(
    (registration) => registration.target,
  )

it('a ref target that is still undefined waits, then registers on its element', async () => {
  const onRun = vi.fn()
  const visible = ref(false)
  const panel = ref<HTMLElement>()
  const wrapper = mount(
    defineComponent({
      setup() {
        useHotkey('K', onRun, { target: panel })
        return () =>
          visible.value ? h('div', { ref: panel, tabindex: 0 }) : null
      },
    }),
    { attachTo: document.body },
  )
  expect(registrationCount()).toBe(0)
  press()
  expect(onRun).not.toHaveBeenCalled()
  visible.value = true
  await nextTick()
  await nextTick()
  expect(registeredTargets()).toEqual([panel.value])
  pressIn(panel.value!)
  expect(onRun).toHaveBeenCalledOnce()
  wrapper.unmount()
})

const Child = defineComponent({
  setup: () => () => h('div', { tabindex: 0, class: 'child' }),
})

it('a component ref target listens on the component root element', async () => {
  const onRun = vi.fn()
  const child = ref<InstanceType<typeof Child> | null>(null)
  const wrapper = mount(
    defineComponent({
      setup() {
        useHotkey('K', onRun, { target: child })
        return () => h('main', [h(Child, { ref: child }), h('button')])
      },
    }),
    { attachTo: document.body },
  )
  await nextTick()
  const root = wrapper.find('.child').element
  expect(registeredTargets()).toEqual([root])
  pressIn(wrapper.find('button').element)
  press()
  expect(onRun).not.toHaveBeenCalled()
  pressIn(root)
  expect(onRun).toHaveBeenCalledOnce()
  wrapper.unmount()
})

it('a component template ref works as a target', async () => {
  const onRun = vi.fn()
  const wrapper = mount(
    defineComponent({
      setup() {
        const child = useTemplateRef<InstanceType<typeof Child>>('child')
        useHotkey('K', onRun, { target: child })
        return () => h(Child, { ref: 'child' })
      },
    }),
    { attachTo: document.body },
  )
  await nextTick()
  const root = wrapper.find('.child').element
  expect(registeredTargets()).toEqual([root])
  pressIn(root)
  expect(onRun).toHaveBeenCalledOnce()
  wrapper.unmount()
})

it('a component with a fragment root registers nothing and does not throw', async () => {
  const errors: Array<unknown> = []
  const FragmentChild = defineComponent({
    setup: () => () => h(Fragment, [h('span'), h('span')]),
  })
  const child = ref<InstanceType<typeof FragmentChild> | null>(null)
  const wrapper = mount(
    defineComponent({
      setup() {
        useHotkey('K', () => {}, { target: child })
        return () => h(FragmentChild, { ref: child })
      },
    }),
    { global: { config: { errorHandler: (error) => errors.push(error) } } },
  )
  await nextTick()
  expect(child.value).not.toBeNull()
  expect(errors).toEqual([])
  expect(registrationCount()).toBe(0)
  wrapper.unmount()
})
