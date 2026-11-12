import { detectPlatform, formatForDisplay } from '@tanstack/hotkeys'
import clsx from 'clsx'
import { For, Show } from 'solid-js'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { useStyles } from '../styles/use-styles'
import {
  KEYBOARD_LAYOUT_SELECTION_ID,
  keyboardLayoutSummary,
} from './KeyboardLayoutDetails'

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
