import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHotkey } from '../src/useHotkey'
import {
  useHotkeyRecorder,
  type VueHotkeyRecorder,
} from '../src/useHotkeyRecorder'

describe('vue hotkeys adapters', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('syncs a ref passed to the enabled option', async () => {
    const callback = vi.fn()
    const enabled = ref(true)

    const wrapper = mount(
      defineComponent({
        setup() {
          useHotkey('Mod+S', callback, {
            enabled,
            platform: 'mac',
          })

          return () => h('div')
        },
      }),
    )

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    enabled.value = false
    await nextTick()

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    enabled.value = true
    await nextTick()

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('registers once a ref target is attached', async () => {
    const callback = vi.fn()
    const target = ref<HTMLElement | null>(null)

    const wrapper = mount(
      defineComponent({
        setup() {
          useHotkey('Mod+S', callback, {
            target,
            platform: 'mac',
          })

          return () => h('div', { ref: target, tabIndex: 0 })
        },
      }),
    )

    await nextTick()

    wrapper.element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )

    expect(callback).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('syncs recorder options from a getter', async () => {
    const onRecord = vi.fn()
    const firstOnCancel = vi.fn()
    const secondOnCancel = vi.fn()
    const onCancel = ref(firstOnCancel)
    let recorder!: VueHotkeyRecorder

    const wrapper = mount(
      defineComponent({
        setup() {
          recorder = useHotkeyRecorder(() => ({
            onRecord,
            onCancel: onCancel.value,
          }))

          return () => h('div')
        },
      }),
    )

    recorder.startRecording()
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )
    expect(firstOnCancel).toHaveBeenCalledTimes(1)
    expect(secondOnCancel).not.toHaveBeenCalled()

    onCancel.value = secondOnCancel
    await nextTick()

    recorder.startRecording()
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )
    expect(secondOnCancel).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
