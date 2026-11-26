import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AppHotkeysStore,
  HotkeyManager,
  HotkeyRecorder,
  areHotkeysEqual,
  defineAppHotkeys,
  formatForDisplay,
  isCustomHotkey,
  matchesKeyboardEvent,
} from '../src'
import type { KeyOptions } from '@tanstack/hotkeys-test-utils'
import type {
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  RecorderRejection,
} from '../src'

// The default recorder mode, `recordBy: 'auto'`: a press is recorded by what
// it typed when that names it, and by physical code otherwise.

type Press = Omit<KeyOptions, 'target'>

const recorders: Array<HotkeyRecorder> = []

afterEach(() => {
  recorders.splice(0).forEach((recorder) => recorder.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  vi.restoreAllMocks()
})

/** Records one key press and returns what the recorder did with it. */
function record(
  press: Press,
  platform: HotkeyPlatform,
  options: Partial<HotkeyChordRecorderOptions> = {},
) {
  let hotkey: HotkeyChord | undefined
  let rejection: RecorderRejection | undefined
  const recorder = new HotkeyRecorder({
    platform,
    onRecord: (recorded) => (hotkey = recorded),
    onReject: (rejected) => (rejection = rejected),
    ...options,
  })
  recorders.push(recorder)
  recorder.start()
  const event = keydown({ ...press, target: document })
  recorder.destroy()
  keyup({ ...press, target: document })
  return { hotkey, rejection, event }
}

describe('recordBy: auto', () => {
  it.each<[string, HotkeyPlatform, Press, string, string]>([
    // Letters follow the layout, so the label is the keycap
    [
      'US Ctrl+S',
      'windows',
      { key: 's', code: 'KeyS', ctrlKey: true },
      'Mod+S',
      'Ctrl+S',
    ],
    [
      'AZERTY Ctrl+A',
      'windows',
      { key: 'a', code: 'KeyQ', ctrlKey: true },
      'Mod+A',
      'Ctrl+A',
    ],
    [
      'German Ctrl+Z',
      'windows',
      { key: 'z', code: 'KeyY', ctrlKey: true },
      'Mod+Z',
      'Ctrl+Z',
    ],
    [
      'Dvorak Ctrl+S',
      'windows',
      { key: 's', code: 'Semicolon', ctrlKey: true },
      'Mod+S',
      'Ctrl+S',
    ],
    [
      'Shift+A',
      'windows',
      { key: 'A', code: 'KeyA', shiftKey: true },
      'Shift+A',
      'Shift+A',
    ],
    [
      'German Ctrl+Ü',
      'windows',
      { key: 'ü', code: 'BracketLeft', ctrlKey: true },
      'Mod+Ü',
      'Ctrl+Ü',
    ],
    [
      'macOS Cmd+Shift+A',
      'mac',
      { key: 'a', code: 'KeyA', metaKey: true, shiftKey: true },
      'Mod+Shift+A',
      '⇧ ⌘ A',
    ],
    // Named keys
    [
      'Shift+Enter',
      'windows',
      { key: 'Enter', code: 'Enter', shiftKey: true },
      'Shift+Enter',
      'Shift+↵',
    ],
    [
      'Ctrl+ArrowUp',
      'windows',
      { key: 'ArrowUp', code: 'ArrowUp', ctrlKey: true },
      'Mod+ArrowUp',
      'Ctrl+↑',
    ],
    ['F5', 'windows', { key: 'F5', code: 'F5' }, 'F5', 'F5'],
    [
      'Ctrl+Space',
      'windows',
      { key: ' ', code: 'Space', ctrlKey: true },
      'Mod+Space',
      'Ctrl+␣',
    ],
    // Digits and symbols typed without Shift
    [
      'Ctrl+1',
      'windows',
      { key: '1', code: 'Digit1', ctrlKey: true },
      'Mod+1',
      'Ctrl+1',
    ],
    [
      'Ctrl+/',
      'windows',
      { key: '/', code: 'Slash', ctrlKey: true },
      'Mod+/',
      'Ctrl+/',
    ],
    // Symbols typed with Shift, written without Shift as by hand
    [
      'US Shift+/',
      'windows',
      { key: '?', code: 'Slash', shiftKey: true },
      '?',
      '?',
    ],
    [
      'AZERTY ? (Shift+,)',
      'windows',
      { key: '?', code: 'KeyM', shiftKey: true },
      '?',
      '?',
    ],
    [
      'US Shift+1',
      'windows',
      { key: '!', code: 'Digit1', shiftKey: true },
      '!',
      '!',
    ],
    // AZERTY types digits with Shift
    [
      'AZERTY Shift+&',
      'windows',
      { key: '1', code: 'Digit1', shiftKey: true },
      '1',
      '1',
    ],
    // Only where it is typed, as with German `Mod+Ü`
    [
      'German Shift+3',
      'windows',
      { key: '§', code: 'Digit3', shiftKey: true },
      '§',
      '§',
    ],
    [
      'Ctrl+Shift+/',
      'windows',
      { key: '?', code: 'Slash', ctrlKey: true, shiftKey: true },
      'Mod+?',
      'Ctrl+?',
    ],
    // macOS reports `/` for Cmd+Shift+/, and the press typed `?` there too
    [
      'macOS Cmd+Shift+/',
      'mac',
      { key: '/', code: 'Slash', metaKey: true, shiftKey: true },
      'Mod+?',
      '⌘ ?',
    ],
    // Elsewhere Command may report the unshifted character, so Shift stays
    [
      'Dvorak macOS Cmd+Shift+/',
      'mac',
      { key: '/', code: 'BracketLeft', metaKey: true, shiftKey: true },
      'Mod+Shift+/',
      '⇧ ⌘ /',
    ],
    [
      'German macOS Cmd+Shift+ß',
      'mac',
      { key: '?', code: 'Minus', metaKey: true, shiftKey: true },
      'Mod+Shift+?',
      '⇧ ⌘ ?',
    ],
    // Most layouts type `;` with Shift on the US `,` key, not `<`
    [
      'macOS Cmd+Shift+,',
      'mac',
      { key: ',', code: 'Comma', metaKey: true, shiftKey: true },
      'Mod+Shift+,',
      '⇧ ⌘ ,',
    ],
    // The digit row with Control, Command or Alt is its digit, as matched
    [
      'AZERTY Ctrl+&',
      'windows',
      { key: '&', code: 'Digit1', ctrlKey: true },
      'Mod+1',
      'Ctrl+1',
    ],
    [
      'Ctrl+Shift+1',
      'windows',
      { key: '!', code: 'Digit1', ctrlKey: true, shiftKey: true },
      'Mod+Shift+1',
      'Ctrl+Shift+1',
    ],
    [
      'macOS Cmd+Shift+1',
      'mac',
      { key: '1', code: 'Digit1', metaKey: true, shiftKey: true },
      'Mod+Shift+1',
      '⇧ ⌘ 1',
    ],
    [
      'macOS Option+1',
      'mac',
      { key: '¡', code: 'Digit1', altKey: true, keyCode: 49 },
      'Alt+1',
      '⌥ 1',
    ],
    // Control alone with `-` on the digit row is zoom out
    [
      'AZERTY Ctrl+-',
      'windows',
      { key: '-', code: 'Digit6', ctrlKey: true },
      'Mod+-',
      'Ctrl+-',
    ],
    // Numpad Enter and the operators are what they type
    [
      'numpad Enter',
      'windows',
      { key: 'Enter', code: 'NumpadEnter' },
      'Enter',
      '↵',
    ],
    [
      'Ctrl+numpad +',
      'windows',
      { key: '+', code: 'NumpadAdd', ctrlKey: true },
      'Mod++',
      'Ctrl++',
    ],
    ['numpad /', 'windows', { key: '/', code: 'NumpadDivide' }, '/', '/'],
    // A non-Latin letter is named by its position, as the matcher names it
    [
      'Russian Ctrl+ы',
      'windows',
      { key: 'ы', code: 'KeyS', ctrlKey: true },
      'Mod+S',
      'Ctrl+S',
    ],
    [
      'Russian Ctrl+Shift+Ы',
      'windows',
      { key: 'Ы', code: 'KeyS', ctrlKey: true, shiftKey: true },
      'Mod+Shift+S',
      'Ctrl+Shift+S',
    ],
    ['Russian ж', 'windows', { key: 'ж', code: 'Semicolon' }, ';', ';'],
    // macOS Option types another character; keyCode has the keycap letter
    [
      'US Option+S',
      'mac',
      { key: 'ß', code: 'KeyS', altKey: true, keyCode: 83 },
      'Alt+S',
      '⌥ S',
    ],
    [
      'AZERTY Option+A',
      'mac',
      { key: 'æ', code: 'KeyQ', altKey: true, keyCode: 65 },
      'Alt+A',
      '⌥ A',
    ],
    [
      'US Option+Shift+S',
      'mac',
      { key: 'Í', code: 'KeyS', altKey: true, shiftKey: true, keyCode: 83 },
      'Alt+Shift+S',
      '⌥ ⇧ S',
    ],
    [
      'Option+Enter',
      'mac',
      { key: 'Enter', code: 'Enter', altKey: true },
      'Alt+Enter',
      '⌥ ↵',
    ],
    // Option+E starts an accent on a US keyboard, so the press is a dead key
    [
      'US Option+E',
      'mac',
      { key: 'Dead', code: 'KeyE', altKey: true, keyCode: 69 },
      'Alt+E',
      '⌥ E',
    ],
    // Alt types nothing else outside macOS
    [
      'Windows Alt+S',
      'windows',
      { key: 's', code: 'KeyS', altKey: true },
      'Alt+S',
      'Alt+S',
    ],
  ])('records %s by name', (_, platform, press, expected, label) => {
    const { hotkey, event } = record(press, platform)
    expect(hotkey).toBe(expected)
    expect(matchesKeyboardEvent(event, hotkey!, platform)).toBe(true)
    expect(formatForDisplay(hotkey!, { platform })).toBe(label)
  })

  it.each<[string, HotkeyPlatform, Press, string]>([
    [
      'macOS Option+symbol',
      'mac',
      { key: '÷', code: 'Slash', altKey: true },
      'Alt+[Slash]',
    ],
    [
      'macOS Option+letter without a keyCode',
      'mac',
      { key: 'ß', code: 'KeyS', altKey: true },
      'Alt+[KeyS]',
    ],
    [
      'dead key',
      'windows',
      { key: 'Dead', code: 'Backquote', ctrlKey: true },
      'Mod+[Backquote]',
    ],
    [
      'Unidentified key',
      'linux',
      { key: 'Unidentified', code: 'Backquote', ctrlKey: true },
      'Mod+[Backquote]',
    ],
    [
      'a non-breaking space',
      'windows',
      { key: '\u00a0', code: 'Space', ctrlKey: true },
      'Mod+[Space]',
    ],
    [
      'an event with no key',
      'windows',
      { key: '', code: 'KeyS', ctrlKey: true },
      'Mod+[KeyS]',
    ],
    // What the numpad types depends on NumLock
    ['numpad digit', 'windows', { key: '1', code: 'Numpad1' }, '[Numpad1]'],
    [
      'numpad digit with NumLock off',
      'windows',
      { key: 'End', code: 'Numpad1' },
      '[Numpad1]',
    ],
    [
      'numpad decimal',
      'windows',
      { key: ',', code: 'NumpadDecimal' },
      '[NumpadDecimal]',
    ],
    // Shift+- would also fire on Shift+Minus, which types `_`
    [
      'Shift+numpad -',
      'windows',
      { key: '-', code: 'NumpadSubtract', shiftKey: true },
      'Shift+[NumpadSubtract]',
    ],
  ])('records %s by code', (_, platform, press, expected) => {
    const { hotkey, event } = record(press, platform)
    expect(hotkey).toBe(expected)
    expect(matchesKeyboardEvent(event, hotkey!, platform)).toBe(true)
  })

  it('records a Shift+symbol press the same way on macOS and Windows', () => {
    // Windows reports `?` for this press and macOS reports `/`
    const windowsPress = {
      key: '?',
      code: 'Slash',
      ctrlKey: true,
      shiftKey: true,
    }
    const macPress = { key: '/', code: 'Slash', metaKey: true, shiftKey: true }
    const onWindows = record(windowsPress, 'windows')
    const onMac = record(macPress, 'mac')
    expect(onWindows.hotkey).toBe('Mod+?')
    expect(onMac.hotkey).toBe('Mod+?')
    expect(matchesKeyboardEvent(onMac.event, onWindows.hotkey!, 'mac')).toBe(
      true,
    )
    expect(
      matchesKeyboardEvent(onWindows.event, onMac.hotkey!, 'windows'),
    ).toBe(true)
    // The documented spelling fires on both too
    expect(matchesKeyboardEvent(onMac.event, 'Mod+Shift+/', 'mac')).toBe(true)
    expect(
      matchesKeyboardEvent(onWindows.event, 'Mod+Shift+/', 'windows'),
    ).toBe(true)
  })

  it('records a Shift+digit press the same way on macOS and Windows', () => {
    // Windows reports `!` for this press and macOS reports `1`
    const onWindows = record(
      { key: '!', code: 'Digit1', ctrlKey: true, shiftKey: true },
      'windows',
    )
    const onMac = record(
      { key: '1', code: 'Digit1', metaKey: true, shiftKey: true },
      'mac',
    )
    expect(onWindows.hotkey).toBe('Mod+Shift+1')
    expect(onMac.hotkey).toBe(onWindows.hotkey)
    expect(formatForDisplay(onMac.hotkey!, { platform: 'windows' })).toBe(
      'Ctrl+Shift+1',
    )
  })

  // `·` belongs to the Latin script but is a symbol, not a letter
  it('records Control+Shift with a Latin-script symbol on the digit row as its digit', () => {
    // Spanish Control+Shift+3 types `·` on Windows, and macOS reports `3`
    const onWindows = record(
      { key: '·', code: 'Digit3', ctrlKey: true, shiftKey: true },
      'windows',
    )
    const onMac = record(
      { key: '3', code: 'Digit3', metaKey: true, shiftKey: true },
      'mac',
    )
    expect(onWindows.hotkey).toBe('Mod+Shift+3')
    expect(matchesKeyboardEvent(onMac.event, onWindows.hotkey!, 'mac')).toBe(
      true,
    )
  })

  it('records what the press typed when the event has no code', () => {
    const noCode = (press: Omit<Press, 'code'>) =>
      record({ ...press, code: '' }, 'windows')
    expect(noCode({ key: 's', ctrlKey: true }).hotkey).toBe('Mod+S')
    expect(noCode({ key: 'Enter' }).hotkey).toBe('Enter')
    // With a code, `ы` records its position
    expect(noCode({ key: 'ы', ctrlKey: true }).hotkey).toBe('Mod+Ы')
    expect(noCode({ key: '?', shiftKey: true }).hotkey).toBe('?')
    for (const press of [
      noCode({ key: 'ы', ctrlKey: true }),
      noCode({ key: '?', shiftKey: true }),
    ]) {
      expect(matchesKeyboardEvent(press.event, press.hotkey!, 'windows')).toBe(
        true,
      )
    }
    // A dead key and an empty key have nothing to record
    for (const key of ['Dead', '']) {
      const { hotkey, rejection } = noCode({ key })
      expect(hotkey).toBeUndefined()
      expect(rejection).toEqual({ reason: 'missing-code' })
    }
    // By code, nothing without a code can be recorded
    const byCode = record({ key: 's', code: '' }, 'windows', {
      recordBy: 'code',
    })
    expect(byCode.hotkey).toBeUndefined()
    expect(byCode.rejection).toEqual({ reason: 'missing-code' })
  })

  it('records the position when the key is not written like a key name', () => {
    // A synthetic event can report anything as its key
    const press = { key: '[KeyX]', code: 'KeyS', ctrlKey: true }
    expect(record(press, 'windows').hotkey).toBe('Mod+[KeyS]')
    const noCode = record({ ...press, code: '' }, 'windows')
    expect(noCode.hotkey).toBeUndefined()
    expect(noCode.rejection).toEqual({ reason: 'missing-code' })
  })

  it('records the character AltGr typed, which recording by code rejects', () => {
    const press = { key: '@', code: 'KeyQ', altGraph: true }
    const { hotkey, event } = record(press, 'linux')
    expect(hotkey).toBe('@')
    // German AltGr+Q and US Shift+2 both type it
    expect(matchesKeyboardEvent(event, '@', 'linux')).toBe(true)
    expect(
      matchesKeyboardEvent(
        keydown({ key: '@', code: 'Digit2', shiftKey: true }),
        hotkey!,
        'linux',
      ),
    ).toBe(true)
    expect(record(press, 'linux', { recordBy: 'code' }).rejection).toEqual({
      reason: 'alt-graph',
    })
    expect(record(press, 'linux', { recordBy: 'key' }).hotkey).toBe('@')
    // A dead key typed nothing yet
    const dead = { key: 'Dead', code: 'BracketRight', altGraph: true }
    expect(record(dead, 'linux').rejection).toEqual({ reason: 'alt-graph' })
    // AltGr+Home typed nothing, and `Home` alone wouldn't fire on it, with or
    // without a code
    for (const code of ['Home', '']) {
      const home = record({ key: 'Home', code, altGraph: true }, 'linux')
      expect(home.hotkey).toBeUndefined()
      expect(home.rejection).toEqual({ reason: 'alt-graph' })
    }
  })

  it('ignores a key on a modifier position', () => {
    const { hotkey, rejection } = record(
      { key: 'CapsLock', code: 'ControlLeft' },
      'linux',
    )
    expect(hotkey).toBeUndefined()
    expect(rejection).toBeUndefined()
  })

  it('is the default, and code and key stay available', () => {
    const press = { key: 'a', code: 'KeyQ', ctrlKey: true }
    expect(record(press, 'windows').hotkey).toBe('Mod+A')
    expect(record(press, 'windows', { recordBy: 'auto' }).hotkey).toBe('Mod+A')
    expect(record(press, 'windows', { recordBy: 'code' }).hotkey).toBe(
      'Mod+[KeyQ]',
    )
    expect(record(press, 'windows', { recordBy: 'key' }).hotkey).toBe('Mod+A')
  })

  it('equals a hotkey written by hand, so a registered duplicate is reported', () => {
    const { hotkey } = record(
      { key: 's', code: 'KeyS', ctrlKey: true },
      'windows',
    )
    expect(areHotkeysEqual(hotkey!, 'Mod+S', 'windows')).toBe(true)
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', vi.fn(), { platform: 'windows' })
    expect(() =>
      manager.register(hotkey!, vi.fn(), {
        platform: 'windows',
        conflictBehavior: 'error',
      }),
    ).toThrow(/already registered/)
  })
})

describe('onRecord context', () => {
  it('passes the key press that recorded a chord', () => {
    const onRecord = vi.fn()
    const { event } = record(
      { key: 's', code: 'KeyS', ctrlKey: true },
      'windows',
      { onRecord },
    )
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S', {
      kind: 'chord',
      event,
      parsedChord: expect.objectContaining({ key: 'S', ctrl: true }),
      platform: 'windows',
    })
  })

  it('passes the key press of each step of a sequence', () => {
    const onRecord = vi.fn()
    const recorder = new HotkeyRecorder({
      platform: 'windows',
      maxSteps: 2,
      onRecord,
    })
    recorders.push(recorder)
    recorder.start()
    const first = keydown({ key: 'g', code: 'KeyG', target: document })
    const second = keydown({ key: 'h', code: 'KeyH', target: document })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'], {
      kind: 'sequence',
      events: [first, second],
      parsedSequence: [
        expect.objectContaining({ key: 'G' }),
        expect.objectContaining({ key: 'H' }),
      ],
      platform: 'windows',
    })
  })

  // A macOS Control+S is the Windows Mod+S, and a Windows Win+S is the
  // macOS Mod+S, so an app that syncs bindings stores the platform too
  it.each<[HotkeyPlatform, Press, string]>([
    ['mac', { key: 's', code: 'KeyS', ctrlKey: true }, 'Control+S'],
    ['windows', { key: 's', code: 'KeyS', metaKey: true }, 'Meta+S'],
    ['mac', { key: 's', code: 'KeyS', metaKey: true }, 'Mod+S'],
  ])('passes the platform it recorded on (%s)', (platform, press, hotkey) => {
    const onRecord = vi.fn()
    record(press, platform, { onRecord })
    expect(onRecord).toHaveBeenCalledWith(
      hotkey,
      expect.objectContaining({ platform }),
    )
  })

  it('lets validate reject the modifiers that differ by platform', () => {
    // The recipe in the recording guide
    const portable: HotkeyChordRecorderOptions['validate'] = (
      _hotkey,
      { parsedChord, platform },
    ) =>
      !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
      'Use Ctrl or Cmd, Shift, and Alt.'
    const press = (platform: HotkeyPlatform, init: Press) =>
      record(init, platform, { validate: portable })
    const ctrlS = { key: 's', code: 'KeyS', ctrlKey: true }
    const metaS = { key: 's', code: 'KeyS', metaKey: true }
    expect(press('mac', ctrlS).rejection?.reason).toBe('validation')
    expect(press('windows', metaS).rejection?.reason).toBe('validation')
    expect(press('mac', metaS).hotkey).toBe('Mod+S')
    expect(press('windows', ctrlS).hotkey).toBe('Mod+S')
  })
})

describe('app hotkey conflicts of a recorded hotkey', () => {
  const appHotkeys = defineAppHotkeys({
    save: { hotkey: 'Mod+S' },
    search: { hotkey: 'Mod+K' },
    help: { hotkey: '?' },
    undo: { hotkey: 'Mod+Z' },
    goHome: { hotkey: ['G', 'H'] },
  })
  const newStore = (platform: HotkeyPlatform = 'windows') =>
    new AppHotkeysStore(appHotkeys, { platform })
  const ids = (conflicts: Array<{ id: string }>) => conflicts.map((c) => c.id)

  it('finds a declared hotkey that a physical recording also fires, from its key press', () => {
    const store = newStore()
    const { hotkey, event } = record(
      { key: 's', code: 'KeyS', ctrlKey: true },
      'windows',
      { recordBy: 'code' },
    )
    expect(hotkey).toBe('Mod+[KeyS]')
    expect(ids(store.findConflicts('search', hotkey!))).toEqual([])
    expect(ids(store.findConflicts('search', hotkey!, { event }))).toEqual([
      'save',
    ])
    expect(ids(store.setCustomHotkey('search', hotkey!, { event }))).toEqual([
      'save',
    ])
    expect(store.appHotkeys.search.hotkey).toBe('Mod+K')
  })

  it('records ? as the declared ? by default', () => {
    const store = newStore()
    const { hotkey } = record(
      { key: '?', code: 'Slash', shiftKey: true },
      'windows',
    )
    expect(hotkey).toBe('?')
    expect(ids(store.findConflicts('search', hotkey!))).toEqual(['help'])
  })

  it('finds a declared hotkey written another way, such as ? for Shift+/', () => {
    const store = newStore()
    for (const recordBy of ['code', 'key'] as const) {
      const { hotkey, event } = record(
        { key: '?', code: 'Slash', shiftKey: true },
        'windows',
        { recordBy },
      )
      expect(ids(store.findConflicts('search', hotkey!))).toEqual([])
      expect(ids(store.findConflicts('search', hotkey!, { event }))).toEqual([
        'help',
      ])
    }
  })

  it('follows the layout of the key press', () => {
    const store = newStore()
    // On a German keyboard the key labelled Z is the US Y position
    const { hotkey, event } = record(
      { key: 'z', code: 'KeyY', ctrlKey: true },
      'windows',
      { recordBy: 'code' },
    )
    expect(hotkey).toBe('Mod+[KeyY]')
    expect(ids(store.findConflicts('search', hotkey!, { event }))).toEqual([
      'undo',
    ])
  })

  it('accepts the context a recorder passes to validate and onRecord', () => {
    const store = newStore()
    const seen: Array<Array<string>> = []
    record({ key: 's', code: 'KeyS', ctrlKey: true }, 'windows', {
      recordBy: 'code',
      validate: (hotkey, context) => {
        seen.push(ids(store.findConflicts('search', hotkey, context)))
        return true
      },
      onRecord: (hotkey, context) => {
        seen.push(ids(store.setCustomHotkey('search', hotkey, context)))
      },
    })
    expect(seen).toEqual([['save'], ['save']])
  })

  it('checks each step of a sequence against its own key press', () => {
    const store = newStore()
    const g = keydown({ key: 'g', code: 'KeyG' })
    const h = keydown({ key: 'h', code: 'KeyH' })
    const recorded = ['[KeyG]', '[KeyH]'] as const
    expect(ids(store.findConflicts('search', [...recorded]))).toEqual([])
    expect(
      ids(store.findConflicts('search', [...recorded], { events: [g, h] })),
    ).toEqual(['goHome'])
    // A different second key press is no conflict
    const x = keydown({ key: 'x', code: 'KeyX' })
    expect(
      ids(
        store.findConflicts('search', ['[KeyG]', '[KeyX]'], { events: [g, x] }),
      ),
    ).toEqual([])
  })

  it('ignores a key press that did not record the hotkey', () => {
    const store = newStore()
    const unrelated = keydown({ key: 's', code: 'KeyS', ctrlKey: true })
    expect(
      ids(store.findConflicts('search', 'Mod+J', { event: unrelated })),
    ).toEqual([])
  })

  it.each<[string, HotkeyPlatform, Press, string, string]>([
    [
      'Shift+/',
      'windows',
      { key: '?', code: 'Slash', shiftKey: true },
      'Shift+[Slash]',
      '?',
    ],
    [
      'AZERTY ?',
      'windows',
      { key: '?', code: 'KeyM', shiftKey: true },
      'Shift+[KeyM]',
      '?',
    ],
    [
      'AZERTY Shift+&',
      'windows',
      { key: '1', code: 'Digit1', shiftKey: true },
      'Shift+[Digit1]',
      '1',
    ],
    [
      'AZERTY Ctrl+&',
      'windows',
      { key: '&', code: 'Digit1', ctrlKey: true },
      'Mod+&',
      'Mod+1',
    ],
    [
      'Ctrl+Shift+/',
      'windows',
      { key: '?', code: 'Slash', ctrlKey: true, shiftKey: true },
      'Mod+Shift+[Slash]',
      'Mod+?',
    ],
    [
      'macOS Cmd+Shift+/',
      'mac',
      { key: '/', code: 'Slash', metaKey: true, shiftKey: true },
      'Mod+Shift+[Slash]',
      'Mod+?',
    ],
    [
      'macOS Cmd+Shift+1',
      'mac',
      { key: '1', code: 'Digit1', metaKey: true, shiftKey: true },
      'Mod+Shift+[Digit1]',
      'Mod+Shift+1',
    ],
    [
      'macOS Option+1',
      'mac',
      { key: '¡', code: 'Digit1', altKey: true, keyCode: 49 },
      'Alt+[Digit1]',
      'Alt+1',
    ],
    [
      'numpad Enter',
      'windows',
      { key: 'Enter', code: 'NumpadEnter' },
      '[NumpadEnter]',
      'Enter',
    ],
    [
      'Ctrl+numpad +',
      'windows',
      { key: '+', code: 'NumpadAdd', ctrlKey: true },
      'Mod+[NumpadAdd]',
      'Mod++',
    ],
  ])(
    'keeps a %s saved by an earlier version working',
    (_, platform, press, saved, recorded) => {
      const store = new AppHotkeysStore(
        defineAppHotkeys({
          old: { hotkey: 'Mod+K' },
          other: { hotkey: 'Mod+J' },
        }),
        { platform },
      )
      expect(store.setCustomHotkey('old', saved as HotkeyChord)).toEqual([])
      const { hotkey, event } = record(press, platform)
      expect(hotkey).toBe(recorded)
      expect(matchesKeyboardEvent(event, saved as HotkeyChord, platform)).toBe(
        true,
      )
      // The strings differ, so only the key press shows the collision
      expect(areHotkeysEqual(saved as HotkeyChord, hotkey!, platform)).toBe(
        false,
      )
      expect(ids(store.findConflicts('other', hotkey!))).toEqual([])
      expect(ids(store.findConflicts('other', hotkey!, { event }))).toEqual([
        'old',
      ])
    },
  )

  it('does not mark a re-recorded default as custom', () => {
    const store = newStore()
    const { hotkey, event } = record(
      { key: 's', code: 'KeyS', ctrlKey: true },
      'windows',
    )
    expect(store.setCustomHotkey('save', hotkey!, { event })).toEqual([])
    expect(isCustomHotkey(store.get('save')!, 'windows')).toBe(false)
    expect(store.customHotkeys).toEqual({})
  })
})
