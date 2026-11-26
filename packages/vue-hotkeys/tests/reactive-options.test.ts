import { HotkeyManager } from '@tanstack/hotkeys'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, nextTick } from 'vue'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeys } from '../src/useHotkeys'
const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
  )
afterEach(() => {
  HotkeyManager.resetInstance()
})
it.each(['local', 'provider'])('updates %s enabled options', async (kind) => {
  const enabled = ref(true),
    callback = vi.fn()
  const Child = defineComponent({
    setup() {
      useHotkey(
        'A',
        callback,
        kind === 'local'
          ? {
              get enabled() {
                return enabled.value
              },
            }
          : {},
      )
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            HotkeysProvider,
            { defaultOptions: { hotkey: { enabled: enabled.value } } },
            { default: () => h(Child) },
          )
      },
    }),
  )
  try {
    press()
    expect(callback).toHaveBeenCalledTimes(1)
    enabled.value = false
    await nextTick()
    press()
    expect(callback).toHaveBeenCalledTimes(1)
  } finally {
    wrapper.unmount()
  }
})

it('refreshes all provider option groups without replacing registrations or active recorders', async () => {
  const enabled = ref(true)

  const first = vi.fn(),
    second = vi.fn(),
    run = vi.fn(),
    override = vi.fn()
  let single!: ReturnType<typeof useHotkeyRecorder>
  let sequence!: ReturnType<typeof useHotkeyRecorder>
  function setupHooks() {
    useHotkey('A', run)
    useHotkeys([{ hotkey: 'B', callback: run }])
    useHotkey(['C', 'D'], run)
    useHotkeys([{ hotkey: ['E', 'F'], callback: run }])
    useHotkey('Z', override, { enabled: true })
    single = useHotkeyRecorder({ onRecord() {} })
    sequence = useHotkeyRecorder({ maxSteps: Infinity, onRecord() {} })
  }
  const invoke = () => {
    for (const key of ['a', 'b', 'c', 'd', 'e', 'f', 'z'])
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      )
  }

  const Child = defineComponent({
    setup() {
      setupHooks()
      return () => h('div')
    },
  })
  const view = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            HotkeysProvider,
            {
              defaultOptions: {
                hotkey: { enabled: enabled.value },
                hotkeyRecorder: { onCancel: enabled.value ? first : second },
              },
            },
            { default: () => h(Child) },
          )
      },
    }),
  )
  try {
    const ids = [...HotkeyManager.getInstance().registrations.state.keys()]
    invoke()
    expect(run).toHaveBeenCalledTimes(4)
    expect(override).toHaveBeenCalledOnce()
    single.startRecording()
    enabled.value = false
    await nextTick()
    single.cancelRecording()
    sequence.startRecording()
    enabled.value = true
    await nextTick()
    sequence.cancelRecording()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    enabled.value = false
    await nextTick()
    invoke()
    expect(run).toHaveBeenCalledTimes(4)
    expect(override).toHaveBeenCalledTimes(2)
    expect([...HotkeyManager.getInstance().registrations.state.keys()]).toEqual(
      ids,
    )
  } finally {
    view.unmount()
  }
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
})

it('stops applying a recorder option the caller no longer passes', async () => {
  const strict = ref(true)
  const onRecord = vi.fn()
  let recorder!: ReturnType<typeof useHotkeyRecorder>
  mount(
    defineComponent({
      setup() {
        recorder = useHotkeyRecorder(() =>
          strict.value
            ? { onRecord, validate: () => 'reserved' as const }
            : { onRecord },
        )
        return () => h('div')
      },
    }),
  )
  strict.value = false
  await nextTick()
  recorder.startRecording()
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      bubbles: true,
    }),
  )
  expect(onRecord).toHaveBeenCalledOnce()
})
