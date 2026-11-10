import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { HotkeysProvider } from '../src/HotkeysProvider'
import {
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
} from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeys } from '../src/useHotkeys'
import type { AppHotkeys, CustomHotkeys, Hotkey } from '@tanstack/hotkeys'

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

describe('app hotkeys and the provider platform', () => {
  it('compares custom hotkeys on the provider platform', async () => {
    const platform = ref<'mac' | 'windows'>('mac')
    let list!: ReturnType<typeof useAppHotkeyList>
    let custom!: ReturnType<typeof useCustomHotkeys>
    const Child = defineComponent({
      setup() {
        list = useAppHotkeyList()
        custom = useCustomHotkeys()
        return () => h('div')
      },
    })
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              HotkeysProvider,
              {
                appHotkeys,
                customHotkeys: { 'doc.save': 'Meta+S' },
                defaultOptions: { platform: platform.value },
              },
              () => h(Child),
            )
        },
      }),
    )

    // Meta+S is Mod+S only on macOS, which the test environment never detects
    expect(list.value[0]!.isCustom).toBe(false)
    expect(
      custom.findConflicts('palette.open', 'Meta+S').map((a) => a.id),
    ).toEqual(['doc.save'])

    platform.value = 'windows'
    await nextTick()
    expect(list.value[0]!.isCustom).toBe(true)
    wrapper.unmount()
  })
})

describe('a nested provider whose app hotkeys arrive late', () => {
  it("gets its own store and leaves its parent's alone", async () => {
    const nestedHotkeys = defineAppHotkeys({ 'file.open': { hotkey: 'Mod+O' } })
    const nested = shallowRef<AppHotkeys>()
    const lists: Record<string, ReturnType<typeof useAppHotkeyList>> = {}
    const List = defineComponent({
      props: { name: { type: String, required: true } },
      setup(props) {
        lists[props.name] = useAppHotkeyList()
        return () => h('div')
      },
    })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(HotkeysProvider, { appHotkeys }, () => [
            h(List, { name: 'root' }),
            h(HotkeysProvider, { appHotkeys: nested.value }, () =>
              h(List, { name: 'nested' }),
            ),
          ]),
      }),
    )
    const ids = (name: string) =>
      lists[name]!.value.map((item) => item.appHotkey.id)
    const rootIds = Object.keys(appHotkeys)
    // Until its own declarations arrive, it shares its parent's store.
    expect([ids('root'), ids('nested')]).toEqual([rootIds, rootIds])

    nested.value = nestedHotkeys
    await nextTick()
    expect([ids('root'), ids('nested')]).toEqual([rootIds, ['file.open']])
    wrapper.unmount()
  })
})
