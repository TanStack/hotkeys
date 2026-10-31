import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import {
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
} from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeys } from '../src/useHotkeys'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { CustomHotkeys, Hotkey } from '@tanstack/hotkeys'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'palette.open': { hotkey: null },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
})

function press(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, bubbles: true, ...init }),
  )
}

function registrations() {
  return [...HotkeyManager.getInstance().registrations.state.values()]
}

function withProvider(
  setup: () => void,
  props: { customHotkeys?: CustomHotkeys<typeof appHotkeys> } = {},
  onChange?: (custom: CustomHotkeys) => void,
) {
  const Child = defineComponent({
    setup() {
      setup()
      return () => h('div')
    },
  })
  return mount(
    defineComponent({
      setup() {
        return () =>
          h(
            HotkeysProvider,
            {
              appHotkeys,
              defaultOptions: { hotkey: { platform: 'mac' } },
              onCustomHotkeysChange: onChange,
              ...props,
            },
            { default: () => h(Child) },
          )
      },
    }),
  )
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys and follows custom hotkeys', async () => {
    const save = vi.fn()
    const onChange = vi.fn()
    let custom!: ReturnType<typeof useCustomHotkeys>
    const wrapper = withProvider(
      () => {
        custom = useCustomHotkeys()
        useHotkey(appHotkeys['doc.save'], save)
        useHotkey(appHotkeys['palette.open'], () => {})
      },
      {},
      onChange,
    )
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S'])
    expect(registrations()[0]!.options).toMatchObject({
      meta: { name: 'Save' },
      appHotkeyId: 'doc.save',
    })
    press('s', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()

    custom.setCustomHotkey('doc.save', ['G', 'S'])
    custom.setCustomHotkey('palette.open', 'Mod+K')
    await nextTick()
    expect(registrations().map((r) => r.hotkey)).toEqual([['G', 'S'], 'Mod+K'])
    expect(onChange).toHaveBeenLastCalledWith({
      'doc.save': ['G', 'S'],
      'palette.open': 'Mod+K',
    })
    press('g')
    press('s')
    expect(save).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    expect(registrations()).toHaveLength(0)
  })

  it('lists app hotkeys with live status', () => {
    let list!: ReturnType<typeof useAppHotkeyList>
    let hotkeys!: ReturnType<typeof useAppHotkeys>
    const wrapper = withProvider(
      () => {
        list = useAppHotkeyList()
        hotkeys = useAppHotkeys()
        useHotkeys([{ hotkey: appHotkeys['nav.home'], callback: () => {} }])
      },
      { customHotkeys: { 'doc.save': 'Mod+Shift+S' } },
    )
    expect(list.value.map((item) => [item.appHotkey.id, item.status])).toEqual([
      ['doc.save', 'inactive'],
      ['palette.open', 'unbound'],
      ['nav.home', 'active'],
    ])
    expect(list.value[0]!.isCustom).toBe(true)
    expect(hotkeys.value['doc.save']!.hotkey).toBe('Mod+Shift+S')
    expect(registrations()[0]!.options).toMatchObject({ timeout: 400 })
    wrapper.unmount()
  })

  it('accepts refs for enabled and skips a null target', async () => {
    const enabled = ref(true)
    const target = ref<HTMLElement | null>(null)
    const callback = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          useHotkey(['G', 'G'], callback, { enabled })
          useHotkey('Mod+K', () => {}, { target, platform: 'mac' })
          return () => h('div')
        },
      }),
    )
    expect(registrations().map((r) => r.hotkey)).toEqual([['G', 'G']])
    press('g')
    press('g')
    expect(callback).toHaveBeenCalledOnce()
    enabled.value = false
    await nextTick()
    press('g')
    press('g')
    expect(callback).toHaveBeenCalledOnce()
    target.value = document.body
    await nextTick()
    expect(registrations()).toHaveLength(2)
    wrapper.unmount()
  })

  it('types options by kind', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          useHotkey('Mod+S', () => {}, { requireReset: true })
          useHotkey(['G', 'G'], () => {}, { timeout: 500 })
          // @ts-expect-error timeout applies only to sequences
          useHotkey('Mod+F', () => {}, { timeout: 500 })
          // @ts-expect-error requireReset applies only to chords
          useHotkey(['D', 'D'], () => {}, { requireReset: true })
          return () => h('div')
        },
      }),
    )
    wrapper.unmount()
  })
})

describe('HotkeysProvider customHotkeys prop', () => {
  it('applies saved data that changes after setup', async () => {
    const saved = ref<CustomHotkeys<typeof appHotkeys> | null>(null)
    const onChange = vi.fn()
    let custom!: ReturnType<typeof useCustomHotkeys>
    const Child = defineComponent({
      setup() {
        custom = useCustomHotkeys()
        return () => h('div')
      },
    })
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              HotkeysProvider,
              {
                appHotkeys,
                customHotkeys: saved.value,
                onCustomHotkeysChange: onChange,
              },
              {
                // A nested provider without appHotkeys shares the store.
                default: () =>
                  h(
                    HotkeysProvider,
                    { scope: 'nested' },
                    { default: () => h(Child) },
                  ),
              },
            )
        },
      }),
    )

    saved.value = { 'doc.save': 'Mod+Shift+S' }
    await nextTick()
    expect(custom.customHotkeys.value).toEqual({ 'doc.save': 'Mod+Shift+S' })
    expect(onChange).not.toHaveBeenCalled()

    // The same value again keeps the user's change.
    custom.setCustomHotkey('palette.open', 'Mod+K')
    saved.value = { 'doc.save': 'Mod+Shift+S' }
    await nextTick()
    expect(custom.customHotkeys.value).toEqual({
      'doc.save': 'Mod+Shift+S',
      'palette.open': 'Mod+K',
    })

    // Another user's data replaces it.
    saved.value = { 'nav.home': ['G', 'G'] }
    await nextTick()
    expect(custom.customHotkeys.value).toEqual({ 'nav.home': ['G', 'G'] })
  })
})

describe('useHotkeyRecorder', () => {
  it('records up to maxSteps', () => {
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    let recorder!: ReturnType<typeof useHotkeyRecorder>
    const wrapper = mount(
      defineComponent({
        setup() {
          recorder = useHotkeyRecorder({
            maxSteps: 2,
            onRecord,
            recordBy: 'key',
          })
          return () => h('div')
        },
      }),
    )
    recorder.startRecording()
    press('g', { code: 'KeyG' })
    expect(recorder.steps.value).toEqual(['G'])
    press('h', { code: 'KeyH' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'])
    wrapper.unmount()
  })
})
