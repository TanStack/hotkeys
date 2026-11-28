import { detectPlatform, formatForDisplay } from '@tanstack/hotkeys'
import clsx from 'clsx'
import { For, Show } from 'solid-js'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { useStyles } from '../styles/use-styles'
import {
  KEYBOARD_LAYOUT_SELECTION_ID,
  keyboardLayoutSummary,
} from './KeyboardLayoutDetails'
import type { LockKey } from '@tanstack/hotkeys'

const LOCKS: Array<[LockKey, string]> = [
  ['CapsLock', 'Caps Lock'],
  ['NumLock', 'Num Lock'],
  ['ScrollLock', 'Scroll Lock'],
]

type LockChipState = 'on' | 'off' | 'unknown' | 'unavailable'

const LOCK_CHIP_TEXT: Record<LockChipState, string> = {
  on: 'On',
  off: 'Off',
  unknown: '?',
  unavailable: 'n/a',
}

export function HeldKeysBar(props: {
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()
  const platform = detectPlatform()

  return (
    <div class={styles().heldKeysBar}>
      <span class={styles().heldKeysBarHeader}>Held</span>
      <div class={styles().heldKeysBarList}>
        <Show
          when={state.heldKeys().length > 0}
          fallback={<span class={styles().noKeysHeld}>--</span>}
        >
          <For each={state.heldKeys()}>
            {(key) => {
              const code = () => state.heldCodes()[key]
              const label = () =>
                formatForDisplay(
                  { key },
                  {
                    platform,
                    useSymbols: true,
                  },
                )
              const codeLabel = () => {
                const c = code()
                return c || undefined
              }
              return (
                <span class={styles().keyCap}>
                  <span>{label()}</span>
                  <Show when={codeLabel() && codeLabel() !== key}>
                    <span class={styles().keyCapCode}>{codeLabel()}</span>
                  </Show>
                </span>
              )
            }}
          </For>
        </Show>
      </div>
      <div class={styles().lockGroup}>
        <span class={styles().heldKeysBarHeader}>Locks</span>
        <For each={LOCKS}>
          {([key, name]) => {
            // Browsers on macOS and iOS never report Num Lock or Scroll Lock.
            const lockState = (): LockChipState => {
              if (key !== 'CapsLock' && platform === 'mac') return 'unavailable'
              const value = state.keyLocks()[key]
              return value === null ? 'unknown' : value ? 'on' : 'off'
            }
            const title = () =>
              ({
                on: `${name} is on`,
                off: `${name} is off`,
                unknown:
                  'Press a key, click, or move the mouse over the page to read it',
                unavailable: `macOS and iOS don't report ${name} to web pages`,
              })[lockState()]
            return (
              <span
                class={clsx(
                  styles().lockChip,
                  lockState() === 'on' && styles().lockChipOn,
                  lockState() === 'unknown' && styles().lockChipUnknown,
                  lockState() === 'unavailable' && styles().lockChipUnavailable,
                )}
                title={title()}
                role="img"
                aria-label={`${name}: ${lockState()}`}
              >
                <span>{name}</span>
                <span class={styles().lockChipValue}>
                  {LOCK_CHIP_TEXT[lockState()]}
                </span>
              </span>
            )
          }}
        </For>
      </div>
      <button
        type="button"
        class={clsx(
          styles().layoutChip,
          props.selectedId() === KEYBOARD_LAYOUT_SELECTION_ID &&
            styles().layoutChipSelected,
        )}
        onClick={() => props.setSelectedId(KEYBOARD_LAYOUT_SELECTION_ID)}
        title="Show the keyboard layout the browser reports"
      >
        <span class={styles().layoutChipLabel}>Layout</span>
        <span>{keyboardLayoutSummary(state.keyboardLayout())}</span>
      </button>
    </div>
  )
}
