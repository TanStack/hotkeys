import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  formatForDisplay,
  formatHotkey,
  hasNonModifierKey,
  normalizeHotkey,
  parseHotkey,
  validateHotkey,
} from '../../src'
import { KEY_TOKENS, PLATFORMS } from './fixtures'

// Arbitrary strings through the parser, validator and formatters. Runs are
// seeded, so a failure reproduces; fast-check prints the shrunk input. Set
// HOTKEYS_FUZZ_RUNS (and HOTKEYS_FUZZ_SEED) for a longer local search.

const RUNS = {
  seed: Number(process.env.HOTKEYS_FUZZ_SEED ?? 20261108),
  numRuns: Number(process.env.HOTKEYS_FUZZ_RUNS ?? 400),
}

const platform = fc.constantFrom(...PLATFORMS)

/** Strings built from hotkey syntax, so most inputs get past the first check. */
const hotkeyLike = fc
  .array(
    fc.oneof(
      fc.constantFrom(
        'Control',
        'Alt',
        'Shift',
        'Meta',
        'Mod',
        'ctrl',
        'CMD',
        'Option',
        'OS',
        'CommandOrControl',
        'Ctl',
        'Super',
      ),
      fc.constantFrom(...KEY_TOKENS),
      fc.constantFrom(
        '',
        ' ',
        ' ',
        '\t',
        '+',
        '[',
        ']',
        '[]',
        '[Key',
        'KeyA]',
        '[ShiftLeft]',
        '[toString]',
        '[__proto__]',
        'constructor',
        'Unidentified',
        'Process',
        'ß',
        'İ',
        'ǅ',
        '😀',
        'é',
      ),
      fc.string({ maxLength: 3 }),
    ),
    { minLength: 1, maxLength: 5 },
  )
  .map((parts) => parts.join('+'))

const anyString = fc.oneof(
  hotkeyLike,
  fc.string({ unit: 'binary', maxLength: 12 }),
  fc.string({ unit: 'grapheme', maxLength: 12 }),
)

function attempt<T>(
  run: () => T,
): { ok: true; value: T } | { ok: false; error: unknown } {
  try {
    return { ok: true, value: run() }
  } catch (error) {
    return { ok: false, error }
  }
}

describe('parsing arbitrary strings', () => {
  it('parseHotkey, validateHotkey and hasNonModifierKey never throw', () => {
    fc.assert(
      fc.property(anyString, platform, (input, p) => {
        parseHotkey(input, p)
        validateHotkey(input)
        validateHotkey([input, input])
        hasNonModifierKey(input, p)
      }),
      RUNS,
    )
  })

  it('a valid hotkey normalizes, formats and displays without throwing', () => {
    fc.assert(
      fc.property(anyString, platform, (input, p) => {
        fc.pre(validateHotkey(input).valid)
        normalizeHotkey(input, p)
        formatHotkey(parseHotkey(input, p))
        formatForDisplay(input as never, { platform: p })
        formatForDisplay(input as never, { platform: p, parts: true })
      }),
      RUNS,
    )
  })

  it('normalizeHotkey throws only for invalid hotkeys, and only with a library error', () => {
    fc.assert(
      fc.property(anyString, platform, (input, p) => {
        const result = attempt(() => normalizeHotkey(input, p))
        if (result.ok) return
        expect(validateHotkey(input).valid).toBe(false)
        expect(String(result.error)).toMatch(/\[hotkeys\]/)
      }),
      RUNS,
    )
  })

  it('a valid hotkey round-trips through normalize and format', () => {
    fc.assert(
      fc.property(anyString, platform, (input, p) => {
        fc.pre(validateHotkey(input).valid)
        const parsed = parseHotkey(input, p)
        const normalized = normalizeHotkey(input, p)
        expect(parseHotkey(normalized, p)).toEqual(parsed)
        expect(normalizeHotkey(normalized, p)).toBe(normalized)
        expect(validateHotkey(normalized).valid).toBe(true)
        expect(parseHotkey(formatHotkey(parsed), p)).toEqual(parsed)
      }),
      RUNS,
    )
  })

  it('validation agrees with parsing: a valid hotkey has a key, and one without a key is invalid', () => {
    fc.assert(
      fc.property(anyString, platform, (input, p) => {
        const valid = validateHotkey(input).valid
        const hasKey = hasNonModifierKey(input, p)
        if (valid) expect(hasKey).toBe(true)
        if (!hasKey) expect(valid).toBe(false)
      }),
      RUNS,
    )
  })

  it('validation does not depend on the platform, and parsing differs only in how Mod resolves', () => {
    fc.assert(
      fc.property(anyString, (input) => {
        const results = PLATFORMS.map((p) => {
          const { key, code } = parseHotkey(input, p)
          return { key, code }
        })
        expect(results[1]).toEqual(results[0])
        expect(results[2]).toEqual(results[0])
      }),
      RUNS,
    )
  })

  it('a sequence is valid exactly when each step is', () => {
    fc.assert(
      fc.property(
        fc.array(anyString, { minLength: 2, maxLength: 4 }),
        (steps) => {
          const result = validateHotkey(steps)
          expect(result.valid).toBe(
            steps.every((step) => validateHotkey(step).valid),
          )
          for (const error of result.errors) {
            expect(error.step).toBeGreaterThanOrEqual(0)
            expect(error.step).toBeLessThan(steps.length)
          }
        },
      ),
      RUNS,
    )
  })
})
