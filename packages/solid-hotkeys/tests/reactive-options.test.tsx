import { createHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder'
import { createHotkeySequences } from '../src/createHotkeySequences'
import { createHotkeySequence } from '../src/createHotkeySequence'
import { createHotkeys } from '../src/createHotkeys'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys'
import { createHotkey } from '../src/createHotkey'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder'
import { HotkeysProvider } from '../src/HotkeysProvider'
const press = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
  )
afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
})
it('updates a direct enabled property getter without user setOptions', () => {
  const [enabled, setEnabled] = createSignal(true)
  const callback = vi.fn()
  function Child() {
    createHotkey('A', callback, {
      get enabled() {
        return enabled()
      },
    })
    return null
  }
  render(() => <Child />)
  press()
  expect(callback).toHaveBeenCalledTimes(1)
  setEnabled(false)
  press()
  expect(callback).toHaveBeenCalledTimes(1)
})
it('updates provider defaults when its options object is replaced', () => {
  const [enabled, setEnabled] = createSignal(true)
  const callback = vi.fn()
  function Child() {
    createHotkey('A', callback)
    return null
  }
  render(() => (
    <HotkeysProvider defaultOptions={{ hotkey: { enabled: enabled() } }}>
      <Child />
    </HotkeysProvider>
  ))
  press()
  expect(callback).toHaveBeenCalledTimes(1)
  setEnabled(false)
  press()
  expect(callback).toHaveBeenCalledTimes(1)
})
it('updates an active recorder callback property getter', () => {
  const first = vi.fn(),
    second = vi.fn()
  const [current, setCurrent] = createSignal(false)
  let recorder!: ReturnType<typeof createHotkeyRecorder>
  function Child() {
    recorder = createHotkeyRecorder({
      onRecord() {},
      get onCancel() {
        return current() ? second : first
      },
    })
    return null
  }
  render(() => <Child />)
  recorder.startRecording()
  setCurrent(true)
  recorder.cancelRecording()
  expect(second).toHaveBeenCalledOnce()
  expect(first).not.toHaveBeenCalled()
})

it('refreshes all provider option groups without replacing registrations or active recorders', () => {
  const [enabled, setEnabled] = createSignal(true)

  const first = vi.fn(),
    second = vi.fn(),
    run = vi.fn(),
    override = vi.fn()
  let single!: ReturnType<typeof createHotkeyRecorder>
  let sequence!: ReturnType<typeof createHotkeySequenceRecorder>
  function setupHooks() {
    createHotkey('A', run)
    createHotkeys([{ hotkey: 'B', callback: run }])
    createHotkeySequence(['C', 'D'], run)
    createHotkeySequences([{ sequence: ['E', 'F'], callback: run }])
    createHotkey('Z', override, { enabled: true })
    single = createHotkeyRecorder({ onRecord() {} })
    sequence = createHotkeySequenceRecorder({ onRecord() {} })
  }
  const invoke = () => {
    for (const key of ['a', 'b', 'c', 'd', 'e', 'f', 'z'])
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      )
  }

  function Child() {
    setupHooks()
    return null
  }
  const defaults = () => ({
    hotkey: { enabled: enabled() },
    hotkeySequence: { enabled: enabled() },
    hotkeyRecorder: { onCancel: enabled() ? first : second },
    hotkeySequenceRecorder: { onCancel: enabled() ? first : second },
  })
  const view = render(() => (
    <HotkeysProvider defaultOptions={defaults()}>
      <Child />
    </HotkeysProvider>
  ))
  const ids = [...HotkeyManager.getInstance().registrations.state.keys()]
  const sequenceIds = [
    ...SequenceManager.getInstance().registrations.state.keys(),
  ]
  invoke()
  expect(run).toHaveBeenCalledTimes(4)
  expect(override).toHaveBeenCalledOnce()
  single.startRecording()
  setEnabled(false)
  single.cancelRecording()
  sequence.startRecording()
  setEnabled(true)
  sequence.cancelRecording()
  expect(first).toHaveBeenCalledOnce()
  expect(second).toHaveBeenCalledOnce()
  setEnabled(false)
  invoke()
  expect(run).toHaveBeenCalledTimes(4)
  expect(override).toHaveBeenCalledTimes(2)
  expect([...HotkeyManager.getInstance().registrations.state.keys()]).toEqual(
    ids,
  )
  expect([...SequenceManager.getInstance().registrations.state.keys()]).toEqual(
    sequenceIds,
  )
  view.unmount()
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
  expect(SequenceManager.getInstance().registrations.state.size).toBe(0)
})
