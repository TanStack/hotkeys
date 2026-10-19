import { expect, useLayout } from './layout-fixtures'
import type { Layout } from './layout-fixtures'

/** What one real key press must produce on a layout. */
export interface LayoutCase {
  /** Physical keys held together, such as `'Control+KeyQ'` (see x11.ts). */
  keys: string
  /** Observed bindings that `matchesKeyboardEvent` accepts for the keydown. */
  matches: Array<string>
  /** `normalizeHotkey(parseKeyboardEvent(event))` on Linux. */
  parsed: string
  /** What the recorder (physical mode) produces, if checked. */
  recorded?: string | { reject: string }
}

/**
 * One test per case and layout. Each press is checked against every binding
 * in `bindings`, and the `registered` bindings run through the HotkeyManager,
 * where only the most exact match fires.
 */
export function describeLayouts(
  title: string,
  options: {
    bindings: Array<string>
    registered?: Array<string>
    layouts: Record<Layout, Array<LayoutCase>>
  },
): void {
  const registered = options.registered ?? []
  for (const [layout, cases] of Object.entries(options.layouts)) {
    const test = useLayout(layout, options.bindings, registered)
    test.describe(`${title} on ${layout}`, () => {
      for (const expected of cases) {
        test(expected.keys, async ({ keyboard }) => {
          const { keydown, fired } = await keyboard.press(expected.keys)
          const codePoints = [...keydown.key]
            .map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()}`)
            .join(' ')
          const event = `key=${JSON.stringify(keydown.key)} (${codePoints}) code=${keydown.code} altGraph=${keydown.altGraph}`
          expect(keydown.matches.toSorted(), event).toEqual(
            expected.matches.toSorted(),
          )
          expect(keydown.parsed, event).toBe(expected.parsed)
          if (registered.length > 0) {
            expect(fired, `HotkeyManager callbacks (${event})`).toEqual(
              registered.filter((binding) =>
                expected.matches.includes(binding),
              ),
            )
          }
          if (expected.recorded !== undefined) {
            expect(await keyboard.record(expected.keys), event).toEqual(
              expected.recorded,
            )
          }
        })
      }
    })
  }
}
