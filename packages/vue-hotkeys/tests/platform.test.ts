import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { Component } from 'vue'
import type { HotkeysProviderOptions } from '../src/HotkeysProviderContext'

type Platform = 'mac' | 'windows' | 'linux'

function mountIn(
  defaultOptions: () => HotkeysProviderOptions,
  child: Component,
) {
  return mount({
    render: () =>
      h(HotkeysProvider, { defaultOptions: defaultOptions() }, () => h(child)),
  })
}

function press(init: KeyboardEventInit) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key: 's', bubbles: true, ...init }),
  )
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('provider platform', () => {
  it('formats labels and updates when the platform changes', async () => {
    const platform = ref<Platform>('mac')
    const wrapper = mountIn(
      () => ({ platform: platform.value }),
      defineComponent({
        setup() {
          const format = useFormatForDisplay()
          return () => h('kbd', format('Mod+S'))
        },
      }),
    )
    expect(wrapper.text()).toBe('⌘ S')
    platform.value = 'windows'
    await nextTick()
    expect(wrapper.text()).toBe('Ctrl+S')
    wrapper.unmount()
  })

  it('lets an explicit platform option win', () => {
    const wrapper = mountIn(
      () => ({ platform: 'mac' }),
      defineComponent({
        setup() {
          const format = useFormatForDisplay()
          return () => h('kbd', format('Mod+S', { platform: 'windows' }))
        },
      }),
    )
    expect(wrapper.text()).toBe('Ctrl+S')
    wrapper.unmount()
  })

  it.each([
    ['mac', { metaKey: true }, { ctrlKey: true }],
    ['windows', { ctrlKey: true }, { metaKey: true }],
  ] as const)('matches Mod on %s', (platform, mod, other) => {
    const callback = vi.fn()
    const wrapper = mountIn(
      () => ({ platform }),
      defineComponent({
        setup() {
          useHotkey('Mod+S', callback)
          return () => h('div')
        },
      }),
    )
    press(other)
    expect(callback).not.toHaveBeenCalled()
    press(mod)
    expect(callback).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('lets a per-hotkey platform win', () => {
    const callback = vi.fn()
    const wrapper = mountIn(
      () => ({ platform: 'mac' }),
      defineComponent({
        setup() {
          useHotkey('Mod+S', callback, { platform: 'windows' })
          return () => h('div')
        },
      }),
    )
    press({ metaKey: true })
    expect(callback).not.toHaveBeenCalled()
    press({ ctrlKey: true })
    expect(callback).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', (platform, mod) => {
    const onRecord = vi.fn()
    let recorder!: ReturnType<typeof useHotkeyRecorder>
    const wrapper = mountIn(
      () => ({ platform }),
      defineComponent({
        setup() {
          recorder = useHotkeyRecorder({ onRecord, recordBy: 'key' })
          return () => h('div')
        },
      }),
    )
    recorder.startRecording()
    press(mod)
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
    wrapper.unmount()
  })
})
