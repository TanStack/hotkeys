import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeySequenceRecorder } from '../src/useHotkeySequenceRecorder'
import { useHotkeySequences } from '../src/useHotkeySequences'
import { useHotkeySequence } from '../src/useHotkeySequence'
import { useHotkeys } from '../src/useHotkeys'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys'
import { useHotkey } from '../src/useHotkey'
import { HotkeysProvider } from '../src/HotkeysProvider'
const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
  )
afterEach(() => {
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
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
  let sequence!: ReturnType<typeof useHotkeySequenceRecorder>
  function setupHooks() {
    useHotkey('A', run)
    useHotkeys([{ hotkey: 'B', callback: run }])
    useHotkeySequence(['C', 'D'], run)
    useHotkeySequences([{ sequence: ['E', 'F'], callback: run }])
    useHotkey('Z', override, { enabled: true })
    single = useHotkeyRecorder({ onRecord() {} })
    sequence = useHotkeySequenceRecorder({ onRecord() {} })
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
                hotkeySequence: { enabled: enabled.value },
                hotkeyRecorder: { onCancel: enabled.value ? first : second },
                hotkeySequenceRecorder: {
                  onCancel: enabled.value ? first : second,
                },
              },
            },
            { default: () => h(Child) },
          )
      },
    }),
  )
  try {
    const ids = [...HotkeyManager.getInstance().registrations.state.keys()]
    const sequenceIds = [
      ...SequenceManager.getInstance().registrations.state.keys(),
    ]
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
    expect([
      ...SequenceManager.getInstance().registrations.state.keys(),
    ]).toEqual(sequenceIds)
  } finally {
    view.unmount()
  }
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
  expect(SequenceManager.getInstance().registrations.state.size).toBe(0)
})
