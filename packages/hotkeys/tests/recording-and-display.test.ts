import { afterEach, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  HotkeySequenceRecorder,
  SequenceManager,
  areHotkeysEqual,
  findHotkeyConflicts,
  formatForDisplay,
  formatHotkey,
  matchesHeldModifiers,
  matchesKeyboardEvent,
  normalizeRegisterableHotkey,
  parseHotkey,
  rawHotkeyToParsedHotkey,
  validateHotkey,
} from '../src'
import type { Hotkey } from '../src'

const instances: Array<HotkeyRecorder | HotkeySequenceRecorder> = []
function recorder(options: ConstructorParameters<typeof HotkeyRecorder>[0]) {
  const value = new HotkeyRecorder(options)
  instances.push(value)
  return value
}
function press(key: string, code: string, flags: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    code,
    bubbles: true,
    cancelable: true,
    ...flags,
  })
  document.dispatchEvent(event)
  return event
}
function release(key: string, code: string, flags: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true, ...flags }),
  )
}
afterEach(() => {
  instances.splice(0).forEach((r) => r.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  document.body.replaceChildren()
})

it.each([
  ['ß', 'KeyS', { altKey: true }, 'Alt+[KeyS]'],
  ['™', 'Digit2', { altKey: true }, 'Alt+[Digit2]'],
  ['Dead', 'KeyE', { altKey: true }, 'Alt+[KeyE]'],
  ['A', 'KeyQ', { shiftKey: true }, 'Shift+[KeyQ]'],
  ["'", 'KeyQ', {}, '[KeyQ]'],
  ['+', 'NumpadAdd', {}, '[NumpadAdd]'],
] as const)(
  'records and replays %s without layout conversion',
  (key, code, flags, expected) => {
    let binding: Hotkey | undefined
    const r = recorder({
      platform: 'mac',
      onRecord: (value) => {
        binding = value
      },
    })
    r.start()
    press(key, code, flags)
    expect(binding).toBe(expected)
    release(key, code, flags)
    const callback = vi.fn()
    HotkeyManager.getInstance().register(binding!, callback, {
      platform: 'mac',
    })
    press(key, code, flags)
    expect(callback).toHaveBeenCalledOnce()
  },
)

it('retains code identity through raw, string and parsed serialization', () => {
  for (const code of ['KeyQ', 'Digit2', 'Enter', 'NumpadEnter', 'Slash']) {
    const raw = { code, alt: true }
    const string = normalizeRegisterableHotkey(raw, 'mac')
    expect(parseHotkey(string).code).toBe(code)
    expect(parseHotkey(formatHotkey(rawHotkeyToParsedHotkey(raw))).code).toBe(
      code,
    )
    expect(areHotkeysEqual(raw, string)).toBe(true)
  }
  expect(
    matchesKeyboardEvent(
      new KeyboardEvent('keydown', { key: 'Enter', code: 'NumpadEnter' }),
      '[Enter]',
    ),
  ).toBe(false)
})
it('preserves shifted layout letters and Unicode in key mode', () => {
  const onRecord = vi.fn(),
    r = recorder({ recordBy: 'key', onRecord })
  r.start()
  const event = press('A', 'KeyQ', { shiftKey: true })
  expect(onRecord).toHaveBeenCalledWith('Shift+A')
  expect(matchesKeyboardEvent(event, onRecord.mock.calls[0]![0])).toBe(true)
  release('A', 'KeyQ')
  r.start()
  press('ß', 'Minus')
  expect(onRecord).toHaveBeenLastCalledWith('ß')
})
it('rejects missing codes and AltGraph while ignoring IME', () => {
  const onRecord = vi.fn(),
    onReject = vi.fn(),
    r = recorder({ onRecord, onReject, platform: 'windows' })
  r.start()
  press('s', '')
  expect(onReject).toHaveBeenLastCalledWith(
    expect.objectContaining({ reason: 'missing-code' }),
  )
  const event = new KeyboardEvent('keydown', {
    key: '@',
    code: 'KeyQ',
    ctrlKey: true,
    altKey: true,
  })
  Object.defineProperty(event, 'getModifierState', {
    value: (key: string) => key === 'AltGraph',
  })
  document.dispatchEvent(event)
  expect(onReject).toHaveBeenLastCalledWith(
    expect.objectContaining({ reason: 'alt-graph' }),
  )
  press('Process', 'KeyA', { isComposing: true })
  expect(onReject).toHaveBeenCalledTimes(2)
  expect(onRecord).not.toHaveBeenCalled()
  expect(r.store.state.isRecording).toBe(true)
})
it('suppresses recording keydowns, repeats and releases then allows normal use', () => {
  const down = vi.fn(),
    up = vi.fn(),
    manager = HotkeyManager.getInstance()
  manager.register('Alt+[KeyS]', down, { platform: 'mac' })
  manager.register('Alt+[KeyS]', up, {
    eventType: 'keyup',
    conflictBehavior: 'allow',
    platform: 'mac',
  })
  const r = recorder({ onRecord: vi.fn(), platform: 'mac' })
  r.start()
  press('ß', 'KeyS', { altKey: true })
  press('ß', 'KeyS', { altKey: true, repeat: true })
  release('ß', 'KeyS', { altKey: true })
  expect(down).not.toHaveBeenCalled()
  expect(up).not.toHaveBeenCalled()
  press('ß', 'KeyS', { altKey: true })
  release('ß', 'KeyS', { altKey: true })
  expect(down).toHaveBeenCalledOnce()
  expect(up).toHaveBeenCalledOnce()
})
it('keeps recording after rejection and clears with only onClear', () => {
  const onRecord = vi.fn(),
    onClear = vi.fn(),
    onReject = vi.fn()
  const r = recorder({
    onRecord,
    onClear,
    onReject,
    validate: (_, { parsedHotkey }) =>
      parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
  })
  r.start()
  press('s', 'KeyS')
  expect(onReject).toHaveBeenCalledWith(
    expect.objectContaining({
      reason: 'validation',
      message: 'Include a modifier.',
    }),
  )
  expect(r.store.state.isRecording).toBe(true)
  press('Backspace', 'Backspace')
  expect(onRecord).not.toHaveBeenCalled()
  expect(onClear).toHaveBeenCalledOnce()
  expect(r.store.state.isRecording).toBe(false)
})
it('resolves aliases, disabled state and exclusions', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Control+S', vi.fn(), { platform: 'windows' })
  expect(manager.isRegistered('Mod+S')).toBe(true)
  expect(findHotkeyConflicts('Mod+S', { platform: 'windows' })).toHaveLength(1)
  expect(
    findHotkeyConflicts('Mod+S', {
      platform: 'windows',
      excludeIds: [handle.id],
    }),
  ).toEqual([])
  handle.setOptions({ enabled: false })
  expect(findHotkeyConflicts('Mod+S', { platform: 'windows' })).toEqual([])
  expect(
    findHotkeyConflicts('Mod+S', {
      platform: 'windows',
      includeDisabled: true,
    }),
  ).toHaveLength(1)
})
it('detects physical/logical conflicts from source events and stays active', () => {
  HotkeyManager.getInstance().register('Alt+S', vi.fn(), { platform: 'mac' })
  const onReject = vi.fn(),
    onRecord = vi.fn()
  const r = recorder({
    onRecord,
    onReject,
    detectConflicts: true,
    platform: 'mac',
  })
  r.start()
  press('ß', 'KeyS', { altKey: true })
  expect(onReject).toHaveBeenCalledWith(
    expect.objectContaining({
      reason: 'conflict',
      conflicts: [expect.objectContaining({ type: 'hotkey' })],
    }),
  )
  expect(onRecord).not.toHaveBeenCalled()
  expect(r.store.state.isRecording).toBe(true)
})
it('allows disjoint targets and finds overlapping targets', () => {
  const a = document.createElement('div'),
    b = document.createElement('div'),
    child = document.createElement('div')
  a.append(child)
  document.body.append(a, b)
  HotkeyManager.getInstance().register('Alt+[KeyS]', vi.fn(), { target: a })
  expect(findHotkeyConflicts('Alt+[KeyS]', { target: b })).toEqual([])
  expect(findHotkeyConflicts('Alt+[KeyS]', { target: child })).toHaveLength(1)
  expect(findHotkeyConflicts('Alt+[KeyS]')).toHaveLength(1)
  expect(
    findHotkeyConflicts('Alt+[KeyS]', { target: b, scope: 'all' }),
  ).toHaveLength(1)
  expect(findHotkeyConflicts('Alt+[KeyS]', { eventType: 'keyup' })).toEqual([])
})
it('finds sequence prefix conflicts in both directions', () => {
  SequenceManager.getInstance().register(['[KeyG]', '[KeyG]'], vi.fn())
  expect(findHotkeyConflicts('[KeyG]')).toHaveLength(1)
  expect(findHotkeyConflicts(['[KeyG]', '[KeyG]', '[KeyD]'])).toHaveLength(1)
  expect(findHotkeyConflicts(['[KeyG]', '[KeyD]'])).toEqual([])
  HotkeyManager.getInstance().register('[KeyX]', vi.fn())
  expect(findHotkeyConflicts(['[KeyX]', '[KeyD]'])).toHaveLength(1)
})
it('retains rejected sequence steps, allows editing, and clears without onRecord', () => {
  const onRecord = vi.fn(),
    onReject = vi.fn(),
    onClear = vi.fn()
  const r = new HotkeySequenceRecorder({
    onRecord,
    onReject,
    onClear,
    validate: (steps) => steps.length >= 2 || 'Two steps required',
  })
  instances.push(r)
  r.start()
  press('g', 'KeyG')
  release('g', 'KeyG')
  r.commit()
  expect(onReject).toHaveBeenCalledWith(
    expect.objectContaining({ reason: 'validation' }),
  )
  expect(r.store.state.steps).toEqual(['[KeyG]'])
  press('g', 'KeyG')
  release('g', 'KeyG')
  r.commit()
  expect(onRecord).toHaveBeenCalledWith(['[KeyG]', '[KeyG]'])
  r.start()
  press('x', 'KeyX')
  release('x', 'KeyX')
  press('Backspace', 'Backspace')
  release('Backspace', 'Backspace')
  expect(r.store.state.steps).toEqual([])
  press('Backspace', 'Backspace')
  expect(onClear).toHaveBeenCalledOnce()
  expect(onRecord).toHaveBeenCalledTimes(1)
})
it('skips unchanged options, including fresh equivalent metadata', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+S', vi.fn(), {
      meta: { name: 'Save', group: 'Editor' },
    }),
    notify = vi.fn()
  manager.registrations.subscribe(notify)
  handle.setOptions({ meta: { name: 'Save', group: 'Editor' } })
  expect(notify).not.toHaveBeenCalled()
  handle.setOptions({ meta: { name: 'Save', group: 'Other' } })
  expect(notify).toHaveBeenCalledOnce()
})
it('formats literal plus as one token and separates symbol options', () => {
  expect(
    formatForDisplay('Control++', { platform: 'windows', parts: true }),
  ).toEqual(['Ctrl', '+'])
  expect(
    formatForDisplay('Control++', {
      platform: 'windows',
      separatorToken: ' | ',
    }),
  ).toBe('Ctrl | +')
  expect(
    formatForDisplay('Shift+ArrowUp', {
      platform: 'mac',
      parts: true,
      useSymbols: { modifiers: false, keys: true },
    }),
  ).toEqual(['Shift', '↑'])
  expect(
    formatForDisplay('Shift+ArrowUp', {
      platform: 'mac',
      useSymbols: { modifiers: true, keys: false },
    }),
  ).toBe('⇧ ArrowUp')
  expect(
    formatForDisplay({ code: 'KeyQ', alt: true }, { platform: 'mac' }),
  ).toBe('⌥ Q')
  expect(
    formatForDisplay(parseHotkey('Alt+[KeyQ]'), {
      platform: 'mac',
      keyLabels: { KeyQ: 'A' },
      parts: true,
    }),
  ).toEqual(['⌥', 'A'])
  expect(validateHotkey('Control++').valid).toBe(true)
  expect(validateHotkey('Alt+[KeyQ]').valid).toBe(true)
  expect(validateHotkey('Alt+[Key Q]').valid).toBe(false)
})
it('matches nonempty modifier subsets with exact and platform options', () => {
  expect(matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'x'])).toBe(true)
  expect(
    matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt'], { exact: true }),
  ).toBe(false)
  expect(
    matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Shift'], { exact: true }),
  ).toBe(true)
  expect(matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Control'])).toBe(
    false,
  )
  expect(matchesHeldModifiers('Alt+[KeyK]', [])).toBe(false)
  expect(
    matchesHeldModifiers('Control+Alt+[KeyK]', ['Control', 'Alt', 'AltGraph']),
  ).toBe(false)
  expect(
    matchesHeldModifiers('Mod+[KeyK]', ['Meta'], { platform: 'mac' }),
  ).toBe(true)
})

it('releases pre-recording reset latches without firing keyup callbacks', () => {
  const callback = vi.fn()
  HotkeyManager.getInstance().register('[KeyS]', callback, {
    requireReset: true,
  })
  press('s', 'KeyS')
  const r = recorder({ onRecord: vi.fn() })
  r.start()
  release('s', 'KeyS')
  r.cancel()
  press('s', 'KeyS')
  expect(callback).toHaveBeenCalledTimes(2)
})
it('does not carry sequence progress across a recorded chord', () => {
  const callback = vi.fn()
  SequenceManager.getInstance().register(['[KeyG]', '[KeyG]'], callback)
  press('g', 'KeyG')
  release('g', 'KeyG')
  const r = recorder({ onRecord: vi.fn() })
  r.start()
  press('x', 'KeyX')
  release('x', 'KeyX')
  press('g', 'KeyG')
  release('g', 'KeyG')
  expect(callback).not.toHaveBeenCalled()
  press('g', 'KeyG')
  expect(callback).toHaveBeenCalledOnce()
})

it('ends recording suppression when macOS swallows the main key release', () => {
  const callback = vi.fn()
  HotkeyManager.getInstance().register('Mod+[KeyS]', callback, {
    platform: 'mac',
  })
  const r = recorder({ onRecord: vi.fn(), platform: 'mac' })
  r.start()
  press('Meta', 'MetaLeft', { metaKey: true })
  press('s', 'KeyS', { metaKey: true })
  // Command+S may not deliver KeyS's keyup; Command release must end the chord.
  release('Meta', 'MetaLeft')
  press('s', 'KeyS', { metaKey: true })
  expect(callback).toHaveBeenCalledOnce()
})

it('rejects a sequence-prefix conflict at commit without executing registered sequences', () => {
  const callback = vi.fn(),
    onRecord = vi.fn(),
    onReject = vi.fn()
  SequenceManager.getInstance().register(['[KeyG]', '[KeyG]'], callback)
  const r = new HotkeySequenceRecorder({
    onRecord,
    onReject,
    detectConflicts: true,
  })
  instances.push(r)
  r.start()
  press('g', 'KeyG')
  release('g', 'KeyG')
  r.commit()
  expect(onReject).toHaveBeenCalledWith(
    expect.objectContaining({
      reason: 'conflict',
      conflicts: [expect.objectContaining({ type: 'sequence' })],
    }),
  )
  expect(r.store.state.steps).toEqual(['[KeyG]'])
  press('g', 'KeyG')
  release('g', 'KeyG')
  expect(callback).not.toHaveBeenCalled()
  expect(onRecord).not.toHaveBeenCalled()
})
