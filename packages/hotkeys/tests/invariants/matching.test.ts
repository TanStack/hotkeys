import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, matchesKeyboardEvent, parseHotkey } from '../../src'
import { normalizeKeyName } from '../../src/constants'
import {
  MODIFIER_SUBSETS,
  PLATFORMS,
  altGraphTypedCharacter,
  failureLog,
  makeEvent,
  realisticEvents,
} from './fixtures'
import type { HotkeyOptions } from '../../src'
import type { EventCase, Platform } from './fixtures'

// How a key press matches chords: modifiers must be exact, composition and
// keyCode 229 never match, repeats respect requireReset and sequences, and a
// keyup hotkey fires for the same presses a keydown hotkey does.

afterEach(() => {
  HotkeyManager.resetInstance()
})

const LITERAL_PREFIXES = MODIFIER_SUBSETS.map((subset) =>
  subset.map((m) => `${m}+`).join(''),
)

/** Physical codes that match a code that has a conventional logical name. */
const CODE_NAMES: Record<string, string> = {
  Backquote: '`',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Equal: '=',
  Minus: '-',
  Period: '.',
  Quote: "'",
  Semicolon: ';',
  Slash: '/',
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
  NumpadEnter: 'Enter',
  Space: 'Space',
}

/** Key tokens a chord for this press could name: what it typed, its position's name, and its code. */
function keyTokens({ key, code }: EventCase['init']): Array<string> {
  const tokens = new Set<string>()
  const typed = normalizeKeyName(key)
  if (typed && !/[+\s]/.test(typed.slice(1))) tokens.add(typed)
  if (code) {
    tokens.add(`[${code}]`)
    const name =
      /^Key[A-Z]$/.test(code) || /^Digit\d$/.test(code)
        ? code.slice(-1)
        : /^Numpad\d$/.test(code)
          ? code.slice(-1)
          : CODE_NAMES[code]
    if (name) tokens.add(name)
  }
  return [...tokens]
}

/** Every chord that names this press's key, with every literal modifier subset. */
function candidates(init: EventCase['init']): Array<string> {
  return LITERAL_PREFIXES.flatMap((prefix) =>
    keyTokens(init).map((token) => prefix + token),
  )
}

/**
 * The shortcut modifiers a press holds, per the docs: AltGr is not
 * Control+Alt, except on Windows when it typed nothing new.
 */
function heldModifiers(init: EventCase['init'], platform: Platform) {
  let ctrl = !!init.ctrlKey
  let alt = !!init.altKey
  if (init.altGraph && platform !== 'mac') {
    const asControlAlt =
      platform === 'windows' && !altGraphTypedCharacter(init.key)
    ctrl = asControlAlt
    alt = asControlAlt
  }
  return { ctrl, alt, shift: !!init.shiftKey, meta: !!init.metaKey }
}

/** Matching pairs: each realistic press with each candidate chord it matches. */
function matchingPairs(platform: Platform) {
  const pairs: Array<{
    label: string
    init: EventCase['init']
    chord: string
  }> = []
  for (const { label, init } of realisticEvents(platform)) {
    const event = makeEvent('keydown', init)
    for (const chord of candidates(init)) {
      if (matchesKeyboardEvent(event, chord as never, platform)) {
        pairs.push({ label, init, chord })
      }
    }
  }
  return pairs
}

describe.each(PLATFORMS)('matching on %s', (platform) => {
  const pairs = matchingPairs(platform)

  it('finds matches to check', () => {
    expect(pairs.length).toBeGreaterThan(1000)
  })

  it('matches only chords whose modifiers equal the held modifiers, except Shift that typed a symbol', () => {
    const log = failureLog()
    for (const { label, init, chord } of pairs) {
      const parsed = parseHotkey(chord, platform)
      const held = heldModifiers(init, platform)
      const sameExceptShift =
        parsed.ctrl === held.ctrl &&
        parsed.alt === held.alt &&
        parsed.meta === held.meta
      if (sameExceptShift && parsed.shift === held.shift) continue
      // Shift needed to type a symbol: `?` matches Shift+/ on a US layout
      const typed = normalizeKeyName(init.key)
      const implicitShift =
        sameExceptShift &&
        held.shift &&
        !parsed.shift &&
        parsed.code === undefined &&
        parsed.key === typed &&
        [...typed].length === 1 &&
        !/^\p{Letter}$/u.test(typed)
      if (!implicitShift) log.add(`${label} matches ${chord}`)
    }
    expect(log.report()).toEqual([])
  })

  it('never matches while composing or with keyCode 229', () => {
    const log = failureLog()
    for (const { label, init, chord } of pairs) {
      for (const extra of [{ isComposing: true }, { keyCode: 229 }]) {
        const event = makeEvent('keydown', init, extra)
        if (matchesKeyboardEvent(event, chord as never, platform)) {
          log.add(`${label} ${JSON.stringify(extra)} matches ${chord}`)
        }
      }
    }
    expect(log.report()).toEqual([])
  })

  // One chord per press keeps the manager checks fast
  const firstPairs = [
    ...new Map(pairs.map((pair) => [pair.label, pair])).values(),
  ]

  function fireCount(
    chord: string | Array<string>,
    events: Array<KeyboardEvent>,
    options: HotkeyOptions & { requireReset?: boolean; timeout?: number } = {},
  ): number {
    const callback = vi.fn()
    const handle = HotkeyManager.getInstance().register(
      chord as never,
      callback,
      {
        platform,
        ignoreInputs: false,
        conflictBehavior: 'allow',
        ...options,
      } as never,
    )
    for (const event of events) document.dispatchEvent(event)
    handle.unregister()
    return callback.mock.calls.length
  }

  it('a composing press never fires a hotkey or advances a sequence', () => {
    const log = failureLog()
    for (const { label, init, chord } of firstPairs) {
      for (const extra of [{ isComposing: true }, { keyCode: 229 }]) {
        const composing = () => makeEvent('keydown', init, extra)
        if (fireCount(chord, [composing()]) !== 0) {
          log.add(`${label} ${JSON.stringify(extra)} fires ${chord}`)
        }
        const steps = [chord, chord]
        const pressed = [
          makeEvent('keydown', init),
          composing(),
          makeEvent('keyup', init),
        ]
        if (fireCount(steps, pressed) !== 0) {
          log.add(
            `${label} ${JSON.stringify(extra)} completes [${chord}, ${chord}]`,
          )
        }
      }
    }
    expect(log.report()).toEqual([])
  })

  it('requireReset fires once per press, however many repeats follow', () => {
    const log = failureLog()
    for (const { label, init, chord } of firstPairs) {
      const repeat = () => makeEvent('keydown', init, { repeat: true })
      const events = [
        makeEvent('keydown', init),
        repeat(),
        repeat(),
        makeEvent('keyup', init),
        makeEvent('keydown', init),
        repeat(),
      ]
      const once = fireCount(chord, events, { requireReset: true })
      if (once !== 2) log.add(`${label}: ${chord} fired ${once} times, not 2`)
      // Without requireReset, chords repeat while held
      const all = fireCount(
        chord,
        events.map((event) =>
          makeEvent(event.type as never, init, { repeat: event.repeat }),
        ),
      )
      if (all !== 5)
        log.add(
          `${label}: ${chord} without requireReset fired ${all} times, not 5`,
        )
    }
    expect(log.report()).toEqual([])
  })

  it('a repeat never advances or completes a sequence', () => {
    const log = failureLog()
    for (const { label, init, chord } of firstPairs) {
      const press = () => makeEvent('keydown', init)
      const repeat = () => makeEvent('keydown', init, { repeat: true })
      const release = () => makeEvent('keyup', init)
      // Holding the key doesn't press it again
      const held = fireCount(
        [chord, chord],
        [press(), repeat(), repeat(), release()],
      )
      if (held !== 0)
        log.add(`${label}: holding completes [${chord}, ${chord}]`)
      // Repeats in between don't break a real second press either
      const twice = fireCount(
        [chord, chord],
        [press(), repeat(), release(), press(), release()],
      )
      if (twice !== 1)
        log.add(
          `${label}: two presses complete [${chord}, ${chord}] ${twice} times`,
        )
    }
    expect(log.report()).toEqual([])
  })

  it('a keyup hotkey fires on release for exactly the presses a keydown hotkey fires on', () => {
    const log = failureLog()
    for (const { label, init } of realisticEvents(platform).filter(
      (_, i) => i % 3 === 0,
    )) {
      for (const chord of candidates(init)) {
        const down = fireCount(chord, [makeEvent('keydown', init)])
        const up = fireCount(
          chord,
          [makeEvent('keydown', init), makeEvent('keyup', init)],
          { eventType: 'keyup' },
        )
        if (down !== up) {
          log.add(
            `${label}: ${chord} fires ${down}× on keydown, ${up}× on keyup`,
          )
        }
        // A keyup hotkey never fires on the keydown itself
        const early = fireCount(chord, [makeEvent('keydown', init)], {
          eventType: 'keyup',
        })
        if (early !== 0) log.add(`${label}: keyup ${chord} fired on keydown`)
      }
    }
    expect(log.report()).toEqual([])
  })

  it('a keyup hotkey fires once when a modifier is released first', () => {
    const log = failureLog()
    const modifierKeys = [
      ['ctrlKey', 'Control', 'ControlLeft'],
      ['altKey', 'Alt', 'AltLeft'],
      ['shiftKey', 'Shift', 'ShiftLeft'],
      ['metaKey', 'Meta', 'MetaLeft'],
    ] as const
    for (const { label, init, chord } of firstPairs) {
      if (init.altGraph) continue
      for (const [flag, key, code] of modifierKeys) {
        if (!init[flag]) continue
        const modifierUp = makeEvent('keyup', {
          ...init,
          key,
          code,
          [flag]: false,
        })
        const keyUp = makeEvent('keyup', { ...init, [flag]: false })
        const count = fireCount(
          chord,
          [makeEvent('keydown', init), modifierUp, keyUp],
          { eventType: 'keyup' },
        )
        if (count !== 1) {
          log.add(
            `${label}: releasing ${key} first fires ${chord} ${count} times`,
          )
        }
      }
    }
    expect(log.report()).toEqual([])
  })

  it('a keyup hotkey does not fire when another key was pressed in between', () => {
    const log = failureLog()
    for (const { label, init, chord } of firstPairs) {
      const other =
        init.code === 'KeyZ'
          ? { ...init, key: 'y', code: 'KeyY' }
          : { ...init, key: 'z', code: 'KeyZ' }
      const count = fireCount(
        chord,
        [
          makeEvent('keydown', init),
          makeEvent('keydown', other),
          makeEvent('keyup', other),
          makeEvent('keyup', init),
        ],
        { eventType: 'keyup' },
      )
      if (count !== 0) log.add(`${label}: ${chord} fired ${count} times`)
    }
    expect(log.report()).toEqual([])
  })

  // issues/bugs/BUG-086-keyup-chord-fires-without-its-press.md
  it.skip('BUG-086: a keyup hotkey fires only for the release of a press it saw', () => {
    const log = failureLog()
    for (const { label, init, chord } of firstPairs) {
      // A release whose press happened elsewhere, such as before focus moved here
      const alone = fireCount(chord, [makeEvent('keyup', init)], {
        eventType: 'keyup',
      })
      if (alone !== 0) log.add(`${label}: a lone release fires ${chord}`)
      if (init.altGraph || !(init.ctrlKey || init.altKey || init.metaKey))
        continue
      // The key first, then its modifiers: the press never matched
      const bare = { key: init.key, code: init.code }
      const [key, code] = init.ctrlKey
        ? ['Control', 'ControlLeft']
        : init.altKey
          ? ['Alt', 'AltLeft']
          : ['Meta', 'MetaLeft']
      const modifierDown = () => makeEvent('keydown', { ...init, key, code })
      const late = fireCount(
        chord,
        [makeEvent('keydown', bare), modifierDown(), makeEvent('keyup', init)],
        { eventType: 'keyup' },
      )
      const keydownFires = fireCount(chord, [
        makeEvent('keydown', bare),
        modifierDown(),
      ])
      if (late !== keydownFires) {
        log.add(
          `${label}: pressing the key before its modifiers fires keyup ${chord} ${late}×, keydown ${keydownFires}×`,
        )
      }
    }
    expect(log.report()).toEqual([])
  })
})
