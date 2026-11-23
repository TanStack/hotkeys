import { expect, useLayout } from './layout-fixtures'
import type { Layout, LayoutOptions } from './layout-fixtures'

/** What one real key press must produce on a layout. */
export interface LayoutCase {
  /** Physical keys held together, such as `'Control+KeyQ'` (see x11.ts). */
  keys: string
  /** Observed bindings that `matchesKeyboardEvent` accepts for the keydown. */
  matches: Array<string>
  /** `normalizeHotkey(parseKeyboardEvent(event))` on Linux. */
  parsed: string
  /** What the recorder produces by default (`recordBy: 'auto'`), if checked. */
  recorded?: string | { reject: string }
  /** What the recorder produces with `recordBy: 'code'`, if checked. */
  recordedByCode?: string | { reject: string }
  /** What the recorder produces with `recordBy: 'key'`, if checked. */
  recordedByKey?: string | { reject: string }
  /** `formatForDisplay(recordedByCode)` on Linux, without a layout map. */
  label?: string
  /**
   * `formatForDisplay(recordedByCode)` with Chromium's `getLayoutMap()`.
   * Firefox has no layout map, so it's checked on Chromium only.
   */
  layoutLabel?: string
  /**
   * The GitHub issue for a suspected library bug this case shows, such as
   * `'#123'`. The case is skipped and its name starts with the issue number.
   */
  bug?: string
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
  } & LayoutOptions,
): void {
  const registered = options.registered ?? []
  for (const [layout, cases] of Object.entries(options.layouts)) {
    const test = useLayout(layout, options.bindings, registered, options)
    test.describe(`${title} on ${layout}`, () => {
      for (const expected of cases) {
        const define = expected.bug ? test.skip : test
        const name = expected.bug
          ? `${expected.bug}: ${expected.keys}`
          : expected.keys
        define(name, async ({ keyboard, page, browserName }) => {
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
          if (expected.recordedByCode !== undefined) {
            expect(
              await keyboard.record(expected.keys, { recordBy: 'code' }),
              `recordBy: 'code' (${event})`,
            ).toEqual(expected.recordedByCode)
          }
          if (expected.recordedByKey !== undefined) {
            expect(
              await keyboard.record(expected.keys, { recordBy: 'key' }),
              `recordBy: 'key' (${event})`,
            ).toEqual(expected.recordedByKey)
          }
          if (
            expected.label !== undefined ||
            expected.layoutLabel !== undefined
          ) {
            if (typeof expected.recordedByCode !== 'string') {
              throw new Error('Labels need a binding recorded by code')
            }
            const binding = expected.recordedByCode
            const { label, layoutLabel } = await page.evaluate(
              (b) => window.harness.formatLabels(b),
              binding,
            )
            if (expected.label !== undefined) {
              expect(label, `label of ${binding}`).toBe(expected.label)
            }
            if (
              expected.layoutLabel !== undefined &&
              browserName === 'chromium'
            ) {
              expect(layoutLabel, `layout map label of ${binding}`).toBe(
                expected.layoutLabel,
              )
            }
          }
        })
      }
    })
  }
}
