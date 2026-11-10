import { describe, expect, it } from 'vitest'
import {
  areHotkeysEqual,
  formatForDisplay,
  formatHotkey,
  hasNonModifierKey,
  normalizeHotkey,
  parseHotkey,
  validateHotkey,
} from '../../src'
import { CHORDS, PLATFORMS, failureLog } from './fixtures'
import type { ParsedHotkeyChord } from '../../src'

// Parsing, normalizing and formatting are lossless for every chord the key
// tables can spell, on every platform.

function same(a: ParsedHotkeyChord, b: ParsedHotkeyChord): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

describe.each(PLATFORMS)('round trips on %s', (platform) => {
  it('parse → normalize → parse gives the same chord, and normalizing again changes nothing', () => {
    const log = failureLog()
    for (const chord of CHORDS) {
      const parsed = parseHotkey(chord, platform)
      const normalized = normalizeHotkey(chord, platform)
      const reparsed = parseHotkey(normalized, platform)
      if (!same(parsed, reparsed)) {
        log.add(`${chord} → ${normalized} parses differently`)
      }
      const again = normalizeHotkey(normalized, platform)
      if (again !== normalized) {
        log.add(`${chord}: normalize gives ${normalized}, then ${again}`)
      }
      if (normalizeHotkey(parsed, platform) !== normalized) {
        log.add(`${chord}: the parsed chord normalizes differently`)
      }
      if (!areHotkeysEqual(chord as never, normalized, platform)) {
        log.add(`${chord} is not equal to its normal form ${normalized}`)
      }
    }
    expect(log.report()).toEqual([])
  })

  it('formatHotkey spells a chord that parses back to the same chord', () => {
    const log = failureLog()
    for (const chord of CHORDS) {
      const parsed = parseHotkey(chord, platform)
      const formatted = formatHotkey(parsed)
      if (!same(parseHotkey(formatted, platform), parsed)) {
        log.add(`${chord} → ${formatted} parses differently`)
      }
      if (
        normalizeHotkey(formatted, platform) !==
        normalizeHotkey(chord, platform)
      ) {
        log.add(`${chord} → ${formatted} normalizes differently`)
      }
    }
    expect(log.report()).toEqual([])
  })

  it('every normal form is valid and has a key', () => {
    const log = failureLog()
    for (const chord of CHORDS) {
      const normalized = normalizeHotkey(chord, platform)
      const { valid, errors } = validateHotkey(normalized)
      if (!valid) log.add(`${normalized}: ${JSON.stringify(errors)}`)
      if (!hasNonModifierKey(normalized, platform)) {
        log.add(`${normalized} has no key`)
      }
    }
    expect(log.report()).toEqual([])
  })

  it('normalizes a sequence step by step', () => {
    const log = failureLog()
    for (let i = 0; i < CHORDS.length; i += 7) {
      const steps = [CHORDS[i]!, CHORDS[(i * 13) % CHORDS.length]!]
      const normalized = normalizeHotkey(steps, platform)
      const expected = steps.map((step) => normalizeHotkey(step, platform))
      if (JSON.stringify(normalized) !== JSON.stringify(expected)) {
        log.add(`${steps.join(' ')} → ${JSON.stringify(normalized)}`)
      }
      if (
        JSON.stringify(normalizeHotkey(normalized, platform)) !==
        JSON.stringify(normalized)
      ) {
        log.add(`${steps.join(' ')}: normalizing twice changes the sequence`)
      }
    }
    expect(log.report()).toEqual([])
  })
})

describe.each(PLATFORMS)('display labels on %s', (platform) => {
  const optionSets = [
    { platform },
    { platform, useSymbols: false },
    { platform, useSymbols: { modifiers: false } },
    { platform, useSymbols: { keys: false } },
    { platform, separatorToken: ' + ' },
  ]

  it('never throw, are stable, and depend only on the chord identity', () => {
    const log = failureLog()
    for (const chord of CHORDS) {
      const parsed = parseHotkey(chord, platform)
      const normalized = normalizeHotkey(chord, platform)
      for (const options of optionSets) {
        let label: string
        try {
          label = formatForDisplay(chord as never, options)
        } catch (error) {
          log.add(`${chord} ${JSON.stringify(options)}: throws ${error}`)
          continue
        }
        if (!label.trim()) log.add(`${chord}: empty label`)
        if (formatForDisplay(chord as never, options) !== label) {
          log.add(`${chord}: label changes between calls`)
        }
        for (const [form, value] of [
          ['normalized', normalized],
          ['parsed', parsed],
        ] as const) {
          const other = formatForDisplay(value as never, options)
          if (other !== label) {
            log.add(
              `${chord}: ${JSON.stringify(label)}, but ${form} gives ${JSON.stringify(other)}`,
            )
          }
        }
      }
    }
    expect(log.report()).toEqual([])
  })

  it('lists one non-empty part per modifier plus the key', () => {
    const log = failureLog()
    for (const chord of CHORDS) {
      const parsed = parseHotkey(chord, platform)
      const parts = formatForDisplay(chord as never, { platform, parts: true })
      if (parts.length !== parsed.modifiers.length + 1) {
        log.add(
          `${chord}: ${JSON.stringify(parts)} for ${parsed.modifiers.length} modifiers`,
        )
      }
      if (parts.some((part) => !part)) {
        log.add(`${chord}: empty part in ${JSON.stringify(parts)}`)
      }
    }
    expect(log.report()).toEqual([])
  })
})
