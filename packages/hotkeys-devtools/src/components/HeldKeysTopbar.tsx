import { For, Show } from 'solid-js'
import { detectPlatform, formatForDisplay } from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import type { RegisterableHotkey } from '@tanstack/hotkeys'

export function HeldKeysBar() {
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
                formatForDisplay(key as RegisterableHotkey, {
                  platform,
                  useSymbols: true,
                })
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
    </div>
  )
}
