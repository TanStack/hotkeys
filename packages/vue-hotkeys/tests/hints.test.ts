import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { useHotkeyHint } from '../src/useHotkeyHint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('updates hints for held modifiers, changing bindings and blur', async () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', () => {})
  manager.register('Control+[KeyS]', () => {})
  const binding = ref<Hotkey>('Alt+[KeyS]')
  const wrapper = mount(
    defineComponent({
      setup() {
        const hint = useHotkeyHint(binding)
        return () => h('span', String(hint.value))
      },
    }),
  )
  expect(wrapper.text()).toBe('false')
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
  )
  await nextTick()
  expect(wrapper.text()).toBe('true')
  binding.value = 'Control+[KeyS]'
  await nextTick()
  expect(wrapper.text()).toBe('false')
  binding.value = 'Alt+[KeyS]'
  await nextTick()
  expect(wrapper.text()).toBe('true')
  handle.setOptions({ enabled: false })
  await nextTick()
  expect(wrapper.text()).toBe('false')
  handle.setOptions({ enabled: true })
  await nextTick()
  expect(wrapper.text()).toBe('true')
  const release = manager.activateScope('dialog', { exclusive: true })
  await nextTick()
  expect(wrapper.text()).toBe('false')
  release()
  await nextTick()
  expect(wrapper.text()).toBe('true')
  window.dispatchEvent(new Event('blur'))
  await nextTick()
  expect(wrapper.text()).toBe('false')
  wrapper.unmount()
})
