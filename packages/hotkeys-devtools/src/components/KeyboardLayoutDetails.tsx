import { formatForDisplay } from '@tanstack/hotkeys'
import clsx from 'clsx'
import { For, Show, createMemo } from 'solid-js'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { useStyles } from '../styles/use-styles'
import type { DisplayHotkey, KeyboardLayoutMap } from '@tanstack/hotkeys'

/** Selection id for the keyboard layout in the details panel. */
export const KEYBOARD_LAYOUT_SELECTION_ID = 'keyboard-layout'

const digits = Array.from({ length: 10 }, (_, i) => `Digit${(i + 1) % 10}`)
const letters = (keys: string) => [...keys].map((key) => `Key${key}`)

/** Physical rows of a standard keyboard, so the map reads like a keyboard. */
const KEY_ROWS = [
  ['Backquote', ...digits, 'Minus', 'Equal', 'IntlYen'],
  [...letters('QWERTYUIOP'), 'BracketLeft', 'BracketRight', 'Backslash'],
  [...letters('ASDFGHJKL'), 'Semicolon', 'Quote'],
  [
    'IntlBackslash',
    ...letters('ZXCVBNM'),
    'Comma',
    'Period',
    'Slash',
    'IntlRo',
  ],
]

/**
 * Where the layout stands: loaded, not returned by a browser that has the
 * layout API, or not supported by the browser.
 */
type KeyboardLayoutStatus = 'loaded' | 'unavailable' | 'unsupported'

function keyboardLayoutStatus(
  layout: KeyboardLayoutMap | null,
): KeyboardLayoutStatus {
  if (layout) return 'loaded'
  const keyboard =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as { keyboard?: { getLayoutMap?: unknown } }).keyboard
  return typeof keyboard?.getLayoutMap === 'function'
    ? 'unavailable'
    : 'unsupported'
}

export function keyboardLayoutSummary(
  layout: KeyboardLayoutMap | null,
): string {
  const status = keyboardLayoutStatus(layout)
  return status === 'loaded'
    ? `${layout!.size} keys`
    : status === 'unavailable'
      ? 'Unavailable'
      : 'Unsupported'
}

// Codes come from the browser's layout, so they are outside the typed codes.
const label = (code: string, layoutMap: KeyboardLayoutMap | null) =>
  formatForDisplay({ code } as DisplayHotkey, {
    layoutMap: layoutMap ?? undefined,
  })

/** Shows the loaded keyboard layout as keycaps, marking keys whose label it changes. */
export function KeyboardLayoutDetails() {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()
  const layout = () => state.keyboardLayout()

  const rows = createMemo(() => {
    const current = layout()
    if (!current) return []
    const known = new Set(KEY_ROWS.flat())
    const other = [...current.keys()].filter((code) => !known.has(code)).sort()
    return [...KEY_ROWS, other]
      .map((row) => row.filter((code) => current.has(code)))
      .filter((row) => row.length > 0)
  })

  const changed = createMemo(() =>
    rows()
      .flat()
      .filter((code) => label(code, layout()) !== label(code, null)),
  )

  return (
    <>
      <div class={styles().stateHeader}>
        <div class={styles().stateTitle}>Keyboard Layout</div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>Status</div>
          <div class={styles().infoValueMono}>
            {keyboardLayoutSummary(layout())}
          </div>
          <div class={styles().infoLabel}>Source</div>
          <div class={styles().infoValueMono}>
            navigator.keyboard.getLayoutMap()
          </div>
          <Show when={layout()}>
            <div class={styles().infoLabel}>Relabeled</div>
            <div class={styles().infoValueMono}>
              {changed().length} of {layout()!.size} keys
            </div>
          </Show>
        </div>
      </div>

      <div class={styles().detailsGrid}>
        <Show
          when={layout()}
          fallback={
            <div class={styles().detailSection}>
              <div class={styles().layoutNote}>
                {keyboardLayoutStatus(layout()) === 'unavailable'
                  ? 'This browser has the layout API but returned no layout. A permissions policy blocks it in a cross-origin frame without allow="keyboard-map".'
                  : 'This browser does not support navigator.keyboard.getLayoutMap(). Only Chromium browsers do.'}{' '}
                Physical bindings such as Mod+[KeyS] show the key's US label.
              </div>
            </div>
          }
        >
          <div class={styles().detailSection}>
            <div class={styles().detailSectionHeader}>Keys</div>
            <div class={styles().layoutRows}>
              <For each={rows()}>
                {(row) => (
                  <div class={styles().layoutRow}>
                    <For each={row}>
                      {(code) => (
                        <span
                          class={clsx(
                            styles().keyCap,
                            changed().includes(code) &&
                              styles().layoutKeyChanged,
                          )}
                          title={`${code} → ${layout()!.get(code) || '(empty)'}`}
                        >
                          <span>{label(code, layout())}</span>
                          <span class={styles().keyCapCode}>{code}</span>
                        </span>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>
            <div class={styles().layoutNote}>
              Highlighted keys show a different label than the US one. Labels of
              physical bindings use this map in the app. It holds each key's
              character without modifiers, and it is read again when the window
              regains focus. Matching and recording never use it.
            </div>
          </div>
        </Show>
      </div>
    </>
  )
}
