import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  SequenceManager,
  KeyStateTracker,
  createHotkeysScope,
  hotkeysPlugin,
  getHotkeyManager,
  getSequenceManager,
  getKeyStateTracker,
} from '../src'
import type { Hotkey } from '../src'

const scopes: Array<ReturnType<typeof createHotkeysScope>> = []
function scope() {
  const value = createHotkeysScope()
  scopes.push(value)
  return value
}
function key(key: string, type = 'keydown', options: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent(type, { key, bubbles: true, ...options }),
  )
}
async function flush() {
  await Alpine.nextTick()
}

afterEach(() => {
  scopes.splice(0).forEach((value) => value.destroy())
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
})

describe('Alpine lifecycle', () => {
  it('updates bindings and enabled options through Alpine effects', async () => {
    const hotkeys = scope()
    const state = Alpine.reactive({ hotkey: 'A' as Hotkey, enabled: true })
    const callback = vi.fn()
    hotkeys.createHotkey(
      () => state.hotkey,
      callback,
      () => ({ enabled: state.enabled }),
    )
    key('a')
    expect(callback).toHaveBeenCalledOnce()
    state.enabled = false
    await flush()
    key('a')
    expect(callback).toHaveBeenCalledOnce()
    state.hotkey = 'B'
    state.enabled = true
    await flush()
    key('a')
    key('b')
    expect(callback).toHaveBeenCalledTimes(2)
    hotkeys.destroy()
    state.hotkey = 'C'
    await flush()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })

  it('updates hints when the binding changes without a keyboard event', async () => {
    const hotkeys = scope()
    const state = Alpine.reactive({ hotkey: 'Control+S' as Hotkey })
    const hint = hotkeys.createHotkeyHint(() => state.hotkey)
    const held = hotkeys.createHeldKeys()
    const codes = hotkeys.createHeldKeyCodes()
    const hold = hotkeys.createKeyHold('Control')
    let visible = false
    const runner = Alpine.effect(() => {
      visible = hint.value
    })
    key('Control', 'keydown', { ctrlKey: true, code: 'ControlLeft' })
    await flush()
    expect(visible).toBe(true)
    expect(held.value).toContain('Control')
    expect(codes.value.Control).toBe('ControlLeft')
    expect(hold.value).toBe(true)
    state.hotkey = 'Alt+S'
    await flush()
    expect(visible).toBe(false)
    Alpine.release(runner)
  })

  it('reconciles plural shortcuts and sequences and publishes registration state', async () => {
    const hotkeys = scope()
    const state = Alpine.reactive({ active: true })
    const callback = vi.fn()
    const registrations = hotkeys.createHotkeyRegistrations()
    hotkeys.createHotkeys(() =>
      state.active ? [{ hotkey: 'A', callback }] : [],
    )
    hotkeys.createHotkeySequences(() =>
      state.active ? [{ sequence: ['G', 'G'], callback }] : [],
    )
    expect(registrations.hotkeys).toHaveLength(1)
    expect(registrations.sequences).toHaveLength(1)
    key('g')
    key('g', 'keyup')
    key('g')
    expect(callback).toHaveBeenCalledOnce()
    state.active = false
    await flush()
    expect(registrations.hotkeys).toHaveLength(0)
    expect(registrations.sequences).toHaveLength(0)
    expect(getSequenceManager().registrations.state.size).toBe(0)
  })

  it('records shortcuts and sequences and stops active recording on destruction', () => {
    const hotkeys = scope()
    const onRecord = vi.fn()
    const recorder = hotkeys.createHotkeyRecorder({
      onRecord,
      recordBy: 'key',
      platform: 'mac',
    })
    recorder.startRecording()
    expect(recorder.isRecording).toBe(true)
    key('k', 'keydown', { ctrlKey: true })
    expect(onRecord).toHaveBeenCalledWith('Control+K')
    expect(recorder.isRecording).toBe(false)
    const sequence = hotkeys.createHotkeySequenceRecorder({
      onRecord,
      recordBy: 'key',
      platform: 'mac',
    })
    sequence.startRecording()
    key('g')
    key('g', 'keyup')
    expect(sequence.steps).toEqual(['G'])
    sequence.commitRecording()
    expect(sequence.recordedSequence).toEqual(['G'])
    recorder.startRecording()
    hotkeys.destroy()
    expect(recorder.isRecording).toBe(false)
    recorder.startRecording()
    expect(recorder.isRecording).toBe(false)
  })

  it('releases Store subscriptions when the owning scope is destroyed', () => {
    const tracker = getKeyStateTracker()
    const unsubscribe = vi.fn()
    const subscribe = vi
      .spyOn(tracker.store, 'subscribe')
      .mockReturnValue({ unsubscribe })
    const hotkeys = scope()
    hotkeys.createHeldKeys()
    hotkeys.destroy()
    hotkeys.destroy()
    expect(subscribe).toHaveBeenCalledOnce()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('owns $hotkeys registrations for an element and cleans up its removal', async () => {
    Alpine.plugin(hotkeysPlugin)
    document.body.innerHTML = `<div x-data x-init="$hotkeys.createHotkey('A', () => $el.dataset.fired = 'yes')"></div>`
    const element = document.body.firstElementChild as HTMLElement
    Alpine.initTree(element)
    key('a')
    expect(element.dataset.fired).toBe('yes')
    Alpine.destroyTree(element)
    await flush()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })
})

it('applies reactive scoped defaults with per-call and per-definition overrides', async () => {
  const defaults = Alpine.reactive({ enabled: false, preventDefault: false })
  const hotkeys = createHotkeysScope(() => ({
    hotkey: {
      enabled: defaults.enabled,
      preventDefault: defaults.preventDefault,
    },
    hotkeySequence: { enabled: defaults.enabled, timeout: 321 },
    hotkeyRecorder: { recordBy: 'key' },
    hotkeySequenceRecorder: { recordBy: 'key', commitKeys: 'none' },
  }))
  scopes.push(hotkeys)
  const callback = vi.fn()
  hotkeys.createHotkey('A', callback)
  hotkeys.createHotkeys([{ hotkey: 'B', callback, options: { enabled: true } }])
  hotkeys.createHotkeySequence(['G', 'G'], callback)
  hotkeys.createHotkeySequences([
    { sequence: ['X', 'X'], callback, options: { enabled: true } },
  ])
  key('a')
  key('b')
  expect(callback).toHaveBeenCalledOnce()
  const id = [...getHotkeyManager().registrations.state.keys()][0]
  defaults.enabled = true
  await flush()
  key('a')
  expect(callback).toHaveBeenCalledTimes(2)
  expect([...getHotkeyManager().registrations.state.keys()][0]).toBe(id)
  expect(
    [...getSequenceManager().registrations.state.values()].every(
      (r) => r.options.timeout === 321,
    ),
  ).toBe(true)
  const onRecord = vi.fn()
  const recorder = hotkeys.createHotkeyRecorder({ onRecord })
  recorder.startRecording()
  key('k', 'keydown', { code: 'KeyK' })
  expect(onRecord).toHaveBeenCalledWith('K')
  const sequence = hotkeys.createHotkeySequenceRecorder({
    onRecord,
    commitKeys: 'enter',
  })
  sequence.startRecording()
  key('g', 'keydown', { code: 'KeyG' })
  key('g', 'keyup', { code: 'KeyG' })
  key('Enter', 'keydown', { code: 'Enter' })
  expect(onRecord).toHaveBeenLastCalledWith(['G'])
})
