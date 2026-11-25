import { afterEach, describe, expect, it } from 'vitest'
import { HotkeyManager, matchesKeyboardEvent, parseHotkey } from '../../src'
import {
  altGraphTypedCharacter,
  codeToLogicalKey,
  normalizeKeyboardEvent,
} from '../../src/_keyboard-event'
import { hotkeyChordFromKeydown } from '../../src/_recorder-chord'
import {
  allLayoutPresses,
  layoutPress,
  layoutsFor,
  releaseInit,
} from '../fixtures/layout-events'
import { PLATFORMS, makeEvent } from './fixtures'
import type { LayoutModifiers, LayoutPress } from '../fixtures/layout-events'
import type { Platform } from './fixtures'

// Rules from the Sensible Defaults guide, checked on every real layout in
// layout-table.json. Each failure names the platform, layout, press, and
// hotkey, such as `linux fr ctrl+Digit6 ("-")`.

afterEach(() => {
  HotkeyManager.resetInstance()
})

/**
 * Failures a property has on purpose or through an open bug, listed exactly.
 * Each one must still fail, so changing the behavior means removing its line
 * here, and any other failure fails the test. Nothing is skipped.
 */
const KNOWN_GAPS = {
  letters: {
    reason:
      'Greek, Bulgarian, and Hebrew type ASCII punctuation on the Q and W keys, and an ASCII character on a letter key does not fall back to the letter',
    failures: [
      'mac Greek none+KeyQ (";") does not fire Q',
      'mac Bulgarian none+KeyQ (",") does not fire Q',
      'mac Hebrew-PC none+KeyQ ("/") does not fire Q',
      'mac Hebrew-PC none+KeyW ("\'") does not fire W',
      'mac Hebrew none+KeyQ ("/") does not fire Q',
      'windows el none+KeyQ (";") does not fire Q',
      'windows el ctrl+KeyQ (";") does not fire Mod+Q',
      'windows bg none+KeyQ (",") does not fire Q',
      'windows bg ctrl+KeyQ (",") does not fire Mod+Q',
      'windows he none+KeyQ ("/") does not fire Q',
      'windows he ctrl+KeyQ ("/") does not fire Mod+Q',
      'windows he none+KeyW ("\'") does not fire W',
      'windows he ctrl+KeyW ("\'") does not fire Mod+W',
      'linux gr none+KeyQ (";") does not fire Q',
      'linux gr ctrl+KeyQ (";") does not fire Mod+Q',
      'linux bg none+KeyQ (",") does not fire Q',
      'linux bg ctrl+KeyQ (",") does not fire Mod+Q',
      'linux il none+KeyQ ("/") does not fire Q',
      'linux il ctrl+KeyQ ("/") does not fire Mod+Q',
      'linux il none+KeyW ("\'") does not fire W',
      'linux il ctrl+KeyW ("\'") does not fire Mod+W',
    ],
  },
  digits: {
    reason:
      'Thai and Programmer Dvorak type a zoom key there and no digit with Shift; Sensible Defaults says to add Mod+[DigitN]',
    failures: [
      'linux us(dvp) Digit6: no press fires Mod+6',
      'linux us(dvp) Digit9: no press fires Mod+9',
      'linux th Digit3: no press fires Mod+3',
    ],
  },
}

function expectOnlyKnownGaps(
  property: keyof typeof KNOWN_GAPS | 'none',
  platform: Platform,
  failures: Array<string>,
) {
  const known =
    property === 'none'
      ? []
      : KNOWN_GAPS[property].failures.filter((failure) =>
          failure.startsWith(`${platform} `),
        )
  const unexpected = failures.filter((failure) => !known.includes(failure))
  expect(unexpected.slice(0, 25), `${unexpected.length} failures`).toEqual([])
  const fixed = known.filter((failure) => !failures.includes(failure))
  expect(
    fixed,
    property === 'none'
      ? ''
      : `Known gaps no longer fail, so remove them from KNOWN_GAPS: ${KNOWN_GAPS[property].reason}`,
  ).toEqual([])
}

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
const DIGITS = [...'0123456789']
const US_PUNCTUATION = [...'`-=[]\\;\',./~!@#$%^&*()_+{}|:"<>?']
const MODIFIERS = ['ctrl', 'alt', 'shift', 'meta'] as const

function prefix(mods: LayoutModifiers): string {
  return [
    mods.ctrl && 'Control+',
    mods.alt && 'Alt+',
    mods.shift && 'Shift+',
    mods.meta && 'Meta+',
  ]
    .filter(Boolean)
    .join('')
}

/** The platform's primary modifier: Control, or Command on macOS. */
const modKey = (platform: Platform): LayoutModifiers =>
  platform === 'mac' ? { meta: true } : { ctrl: true }

function matches(press: LayoutPress, chord: string): boolean {
  return matchesKeyboardEvent(
    makeEvent('keydown', press.init),
    chord as never,
    press.platform,
  )
}

describe.each(PLATFORMS)('layouts on %s', (platform) => {
  const layouts = layoutsFor(platform)
  const presses = allLayoutPresses(platform)

  it('has layouts to check', () => {
    expect(layouts.length).toBeGreaterThan(25)
  })

  it('a letter hotkey fires on the key that types the letter, or on its US position when the layout has no such key', () => {
    const failures: Array<string> = []
    for (const layout of layouts) {
      for (const letter of LETTERS) {
        for (const [mods, chord] of [
          [{}, letter],
          [modKey(platform), `Mod+${letter}`],
        ] as const) {
          // macOS Command has its own layer, so look the key up at this level
          let code = `Key${letter}`
          for (const candidate of layout.keys.keys()) {
            if (
              layoutPress(layout, candidate, mods)?.init.key ===
              letter.toLowerCase()
            ) {
              code = candidate
              break
            }
          }
          const press = layoutPress(layout, code, mods)
          if (press && !matches(press, chord))
            failures.push(`${press.label} does not fire ${chord}`)
        }
      }
    }
    expectOnlyKnownGaps('letters', platform, failures)
  })

  it('a digit hotkey fires on its digit-row key, with or without Shift', () => {
    const failures: Array<string> = []
    for (const layout of layouts) {
      for (const digit of DIGITS) {
        for (const [mods, chord] of [
          [{}, digit],
          [modKey(platform), `Mod+${digit}`],
        ] as const) {
          const fires = [false, true].some((shift) => {
            const press = layoutPress(layout, `Digit${digit}`, {
              ...mods,
              shift,
            })
            return press && matches(press, chord)
          })
          if (!fires)
            failures.push(
              `${platform} ${layout.id} Digit${digit}: no press fires ${chord}`,
            )
        }
      }
    }
    expectOnlyKnownGaps('digits', platform, failures)
  })

  it('a digit-row key stands in for its digit with any modifiers, except a zoom key with only Control or Command', () => {
    const failures: Array<string> = []
    const zoomModifier = platform === 'mac' ? 'meta' : 'ctrl'
    for (const press of presses) {
      const { code, init } = press
      // A character AltGr types matches only itself
      if (!code.startsWith('Digit') || init.altGraph) continue
      // The modifiers the event reports: Windows AltGr arrives as Control+Alt
      const reported: LayoutModifiers = {
        ctrl: init.ctrlKey,
        alt: init.altKey,
        shift: init.shiftKey,
        meta: init.metaKey,
      }
      const held = MODIFIERS.filter((m) => reported[m])
      const zoom =
        held.length === 1 &&
        held[0] === zoomModifier &&
        /^[-+=]$/.test(init.key)
      const chord = `${prefix(reported)}${code.slice(5)}`
      if (matches(press, chord) === zoom)
        failures.push(
          `${press.label} ${zoom ? 'fires' : 'does not fire'} ${chord}`,
        )
    }
    expectOnlyKnownGaps('none', platform, failures)
  })

  it('a US punctuation hotkey fires on the key that types it', () => {
    const failures: Array<string> = []
    for (const layout of layouts) {
      for (const code of layout.keys.keys()) {
        for (const shift of [false, true]) {
          const bare = layoutPress(layout, code, { shift })
          if (
            bare &&
            US_PUNCTUATION.includes(bare.init.key) &&
            !matches(bare, bare.init.key)
          )
            failures.push(`${bare.label} does not fire ${bare.init.key}`)
          // With Command held, macOS reports the unshifted character
          if (platform === 'mac' && shift) continue
          const mod = layoutPress(layout, code, { ...modKey(platform), shift })
          if (
            mod &&
            US_PUNCTUATION.includes(mod.init.key) &&
            !matches(mod, `Mod+${mod.init.key}`)
          )
            failures.push(`${mod.label} does not fire Mod+${mod.init.key}`)
        }
      }
    }
    expectOnlyKnownGaps('none', platform, failures)
  })

  it('an ASCII character typed without Shift or Option fires no hotkey for another key, outside the digit row', () => {
    const failures: Array<string> = []
    for (const press of presses) {
      const { init, mods, code } = press
      if (mods.shift || init.altGraph || code.startsWith('Digit')) continue
      if (platform === 'mac' && mods.alt) continue
      if (!/^[!-~]$/.test(init.key)) continue
      const position = codeToLogicalKey(code)
      if (!position || position.toLowerCase() === init.key.toLowerCase())
        continue
      const chord = `${prefix(mods)}${position}`
      if (matches(press, chord)) failures.push(`${press.label} fires ${chord}`)
    }
    expectOnlyKnownGaps('none', platform, failures)
  })

  it('a character AltGr types fires its own hotkey and never a Control+Alt one', () => {
    const failures: Array<string> = []
    for (const press of presses) {
      const { init, code } = press
      if (!init.altGraph || init.key === 'Dead' || !init.key.trim()) continue
      // AltGr with Shift at most: Meta is a modifier of its own
      if (init.metaKey) continue
      // An ASCII letter or digit counts as typing nothing new
      if (/^[A-Za-z0-9]$/.test(init.key)) continue
      // Letters match Shift exactly; symbols carry the Shift that typed them
      const own =
        init.shiftKey && /^\p{L}$/u.test(init.key)
          ? `Shift+${init.key}`
          : init.key
      if (!matches(press, own))
        failures.push(`${press.label} does not fire ${own}`)
      const position = codeToLogicalKey(code)
      const shift = init.shiftKey ? 'Shift+' : ''
      if (position && matches(press, `Control+Alt+${shift}${position}`))
        failures.push(`${press.label} fires Control+Alt+${shift}${position}`)
    }
    expectOnlyKnownGaps('none', platform, failures)
  })

  it('a recorded chord matches the press it was recorded from', () => {
    const failures: Array<string> = []
    for (const press of presses) {
      const event = makeEvent('keydown', press.init)
      // HotkeyRecorder rejects whitespace, and Linux AltGr that typed nothing new
      if (!press.init.key.trim()) continue
      if (
        platform === 'linux' &&
        press.init.altGraph &&
        !altGraphTypedCharacter(normalizeKeyboardEvent(event, platform))
      )
        continue
      for (const mode of ['key', 'code', 'auto'] as const) {
        const chord = hotkeyChordFromKeydown(event, platform, mode)
        if (typeof chord === 'string' && !matches(press, chord))
          failures.push(`${press.label}: recordBy ${mode} records ${chord}`)
      }
    }
    expectOnlyKnownGaps('none', platform, failures)
    // About 0.2 s locally, but over 5 s on a loaded CI runner
  }, 30_000)

  it('a keyup hotkey fires once, when its key or one of its modifiers comes up, in any release order', () => {
    const failures: Array<string> = []
    const MODIFIER_KEYS = {
      ctrl: ['Control', 'ControlLeft'],
      alt: ['Alt', 'AltLeft'],
      shift: ['Shift', 'ShiftLeft'],
      meta: ['Meta', 'MetaLeft'],
      altGraph: ['AltGraph', 'AltRight'],
    } as const
    const RELEASABLE = ['ctrl', 'alt', 'shift', 'meta', 'altGraph'] as const
    const seen = new Set<string>()
    for (const layout of layouts) {
      for (const press of presses) {
        if (press.layout !== layout.id) continue
        // Windows AltGr releases Control and Alt too; only Linux AltGr here
        if (platform === 'windows' && press.mods.altGraph) continue
        if (platform === 'windows' && press.init.altGraph) continue
        const held = RELEASABLE.filter((m) => press.mods[m])
        if (held.length === 0 || held.length > 2) continue
        // Layouts that type the same key can release different ones: German
        // and Swiss German both type `?` for Shift+-, then `ß` and `'`
        const releases = held.flatMap((_, i) =>
          held.slice(i).map((_, j) => held.slice(i, i + j + 1)),
        )
        const id = JSON.stringify([
          press.init,
          ...releases.map((released) => releaseInit(layout, press, released)),
        ])
        if (seen.has(id)) continue
        seen.add(id)
        // Chords for the typed key or the position, with or without Shift
        const position = codeToLogicalKey(press.code) ?? ''
        const unshifted = { ...press.mods, shift: false }
        const chords = [
          ...new Set([
            `${prefix(press.mods)}${press.init.key}`,
            `${prefix(press.mods)}${position}`,
            `${prefix(unshifted)}${press.init.key}`,
            `${prefix(unshifted)}${position}`,
          ]),
        ].filter((chord) => {
          try {
            return matches(press, chord)
          } catch {
            return false
          }
        })
        const orders = permutations<string>([...held, 'key'])
        for (const chord of chords) {
          const chordMods = parseHotkey(chord as never, platform)
          for (const order of orders) {
            // A counter, not vi.fn(): Vitest holds every called mock and its
            // call arguments until the test returns
            let calls = 0
            const handle = HotkeyManager.getInstance().register(
              chord as never,
              () => calls++,
              {
                platform,
                eventType: 'keyup',
                ignoreInputs: false,
                conflictBehavior: 'allow',
              },
            )
            document.dispatchEvent(makeEvent('keydown', press.init))
            const released: Array<keyof LayoutModifiers> = []
            // The press ends when its key or one of the chord's modifiers comes up
            let atEnd: number | undefined
            for (const item of order) {
              if (item === 'key') {
                // macOS browsers send no keyup for a key while Command is down
                const commandDown =
                  platform === 'mac' &&
                  press.mods.meta &&
                  !released.includes('meta')
                if (!commandDown) {
                  document.dispatchEvent(
                    makeEvent('keyup', releaseInit(layout, press, released)),
                  )
                  atEnd ??= calls
                }
                continue
              }
              const modifier = item as (typeof RELEASABLE)[number]
              released.push(modifier)
              const still = { ...press.mods }
              for (const r of released) still[r] = false
              const [key, code] = MODIFIER_KEYS[modifier]
              document.dispatchEvent(
                makeEvent('keyup', {
                  key,
                  code,
                  ctrlKey: !!still.ctrl,
                  altKey: !!still.alt,
                  shiftKey: !!still.shift,
                  metaKey: !!still.meta,
                  altGraph: !!still.altGraph,
                }),
              )
              if (modifier !== 'altGraph' && chordMods[modifier])
                atEnd ??= calls
            }
            handle.unregister()
            const count = calls
            if (count !== 1 || atEnd !== 1)
              failures.push(
                `${press.label}: keyup ${chord} fired ${count}× (${atEnd ?? 0}× when the press ended), releasing ${order.join(', ')}`,
              )
          }
        }
      }
    }
    expectOnlyKnownGaps('none', platform, failures)
  }, 120_000)
})

function permutations<T>(items: Array<T>): Array<Array<T>> {
  if (items.length <= 1) return [items]
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [
      item,
      ...rest,
    ]),
  )
}
