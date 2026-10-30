import { describe, expect, it } from 'vitest'
import {
  ALL_KEYS,
  EDITING_KEYS,
  FUNCTION_KEYS,
  LETTER_KEYS,
  MODIFIER_ALIASES,
  MODIFIER_KEYS,
  MODIFIER_ORDER,
  NAVIGATION_KEYS,
  NUMBER_KEYS,
  PUNCTUATION_CODE_MAP,
  PUNCTUATION_KEYS,
  normalizeKeyName,
  validateHotkey,
} from '../src'
import { isKeyNameShape } from '../src/_keyboard-event'

// The exported key tables are public API: their contents and order must not
// change when the code that builds them does.
describe('exported key tables', () => {
  it('keep their exact contents and order', () => {
    expect({
      MODIFIER_ORDER,
      MODIFIER_KEYS: [...MODIFIER_KEYS],
      MODIFIER_ALIASES: Object.entries(MODIFIER_ALIASES).sort(),
      LETTER_KEYS: [...LETTER_KEYS].join(''),
      NUMBER_KEYS: [...NUMBER_KEYS].join(''),
      FUNCTION_KEYS: [...FUNCTION_KEYS].join(' '),
      NAVIGATION_KEYS: [...NAVIGATION_KEYS].join(' '),
      EDITING_KEYS: [...EDITING_KEYS].join(' '),
      PUNCTUATION_KEYS: [...PUNCTUATION_KEYS].join(''),
      PUNCTUATION_CODE_MAP,
    }).toMatchInlineSnapshot(`
      {
        "EDITING_KEYS": "Enter Escape Space Tab Backspace Delete",
        "FUNCTION_KEYS": "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 F13 F14 F15 F16 F17 F18 F19 F20 F21 F22 F23 F24",
        "LETTER_KEYS": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "MODIFIER_ALIASES": [
          [
            "Alt",
            "Alt",
          ],
          [
            "Cmd",
            "Meta",
          ],
          [
            "Command",
            "Meta",
          ],
          [
            "CommandOrControl",
            "Mod",
          ],
          [
            "Control",
            "Control",
          ],
          [
            "Ctrl",
            "Control",
          ],
          [
            "Meta",
            "Meta",
          ],
          [
            "Mod",
            "Mod",
          ],
          [
            "OS",
            "Meta",
          ],
          [
            "Option",
            "Alt",
          ],
          [
            "Shift",
            "Shift",
          ],
          [
            "Win",
            "Meta",
          ],
          [
            "alt",
            "Alt",
          ],
          [
            "cmd",
            "Meta",
          ],
          [
            "command",
            "Meta",
          ],
          [
            "commandorcontrol",
            "Mod",
          ],
          [
            "control",
            "Control",
          ],
          [
            "ctrl",
            "Control",
          ],
          [
            "meta",
            "Meta",
          ],
          [
            "mod",
            "Mod",
          ],
          [
            "option",
            "Alt",
          ],
          [
            "os",
            "Meta",
          ],
          [
            "shift",
            "Shift",
          ],
          [
            "win",
            "Meta",
          ],
        ],
        "MODIFIER_KEYS": [
          "Control",
          "Alt",
          "Shift",
          "Meta",
        ],
        "MODIFIER_ORDER": [
          "Control",
          "Alt",
          "Shift",
          "Meta",
        ],
        "NAVIGATION_KEYS": "ArrowUp ArrowDown ArrowLeft ArrowRight Home End PageUp PageDown",
        "NUMBER_KEYS": "0123456789",
        "PUNCTUATION_CODE_MAP": {
          "Backquote": "\`",
          "Backslash": "\\",
          "BracketLeft": "[",
          "BracketRight": "]",
          "Comma": ",",
          "Equal": "=",
          "Minus": "-",
          "Period": ".",
          "Quote": "'",
          "Semicolon": ";",
          "Slash": "/",
        },
        "PUNCTUATION_KEYS": "/[]\\=-,.;\`'+?!@#$%^&*()_{}|:"<>~",
      }
    `)
  })

  it('combine every key group, named key, and nothing else in ALL_KEYS', () => {
    expect([...ALL_KEYS].join(' ')).toMatchInlineSnapshot(
      `"A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9 F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 F13 F14 F15 F16 F17 F18 F19 F20 F21 F22 F23 F24 ArrowUp ArrowDown ArrowLeft ArrowRight Home End PageUp PageDown Enter Escape Space Tab Backspace Delete / [ ] \\ = - , . ; \` ' + ? ! @ # $ % ^ & * ( ) _ { } | : " < > ~ CapsLock ContextMenu Convert KanaMode NonConvert Help Insert NumLock Fn FnLock PrintScreen ScrollLock Pause BrowserBack BrowserFavorites BrowserForward BrowserHome BrowserRefresh BrowserSearch BrowserStop Eject LaunchMail MediaPlayPause MediaStop MediaTrackNext MediaTrackPrevious Power AudioVolumeDown AudioVolumeMute AudioVolumeUp WakeUp Hyper Super Again Copy Cut Find Open Paste Props Select Undo Hiragana Katakana Clear Cancel Standby LaunchApplication1 LaunchApplication2 LaunchMediaPlayer HangulMode HanjaMode Zenkaku Hankaku ZenkakuHankaku"`,
    )
  })
})

describe('key names', () => {
  it('pass the shape check for every typed key, so typed hotkeys never warn', () => {
    const failing = [...ALL_KEYS].filter((key) => !isKeyNameShape(key))
    expect(failing).toEqual([])
    for (const key of ALL_KEYS)
      expect(validateHotkey(`Mod+${key}` as never).warnings).toEqual([])
  })

  it('warn for spellings that differ from a known key only by case', () => {
    const named = [...ALL_KEYS].filter((key) => key.length > 1)
    for (const key of named) {
      for (const spelling of [key.toLowerCase(), key.toUpperCase()]) {
        if (spelling === key) continue
        expect(isKeyNameShape(spelling), spelling).toBe(false)
      }
    }
  })

  it('normalize only letters and the space character', () => {
    const changed: Array<[string, string]> = []
    for (let point = 0; point <= 0x2fff; point++) {
      const key = String.fromCodePoint(point)
      if (normalizeKeyName(key) !== key)
        changed.push([key, normalizeKeyName(key)])
    }
    for (const key of ALL_KEYS) expect(normalizeKeyName(key)).toBe(key)
    expect(
      changed.every(
        ([key, normalized]) =>
          (key === ' ' && normalized === 'Space') ||
          (/^\p{Letter}$/u.test(key) && normalized === key.toUpperCase()),
      ),
    ).toBe(true)
    expect(normalizeKeyName('escape')).toBe('escape')
  })
})
