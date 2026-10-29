import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@solidjs/testing-library'
import { createSignal, flush } from 'solid-js'
import { HotkeyManager } from '@tanstack/hotkeys'
import { createHotkeys } from '../src/createHotkeys'
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
  flush()
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
  flush()
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
  flush()
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
  let sequence!: ReturnType<typeof createHotkeyRecorder>
  function setupHooks() {
    createHotkey('A', run)
    createHotkeys([{ hotkey: 'B', callback: run }])
    createHotkey(['C', 'D'], run)
    createHotkeys([{ hotkey: ['E', 'F'], callback: run }])
    createHotkey('Z', override, { enabled: true })
    single = createHotkeyRecorder({ onRecord() {} })
    sequence = createHotkeyRecorder({ maxSteps: Infinity, onRecord() {} })
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
    hotkeyRecorder: { onCancel: enabled() ? first : second },
  })
  const view = render(() => (
    <HotkeysProvider defaultOptions={defaults()}>
      <Child />
    </HotkeysProvider>
  ))
  const ids = [...HotkeyManager.getInstance().registrations.state.keys()]
  invoke()
  expect(run).toHaveBeenCalledTimes(4)
  expect(override).toHaveBeenCalledOnce()
  single.startRecording()
  setEnabled(false)
  flush()
  single.cancelRecording()
  sequence.startRecording()
  setEnabled(true)
  flush()
  sequence.cancelRecording()
  expect(first).toHaveBeenCalledOnce()
  expect(second).toHaveBeenCalledOnce()
  setEnabled(false)
  flush()
  invoke()
  expect(run).toHaveBeenCalledTimes(4)
  expect(override).toHaveBeenCalledTimes(2)
  expect([...HotkeyManager.getInstance().registrations.state.keys()]).toEqual(
    ids,
  )
  view.unmount()
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
})
