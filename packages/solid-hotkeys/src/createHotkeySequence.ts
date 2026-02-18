import { createEffect, onCleanup } from 'solid-js'
import { getSequenceManager } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'

export interface CreateHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'enabled'
> {
  /** Whether the sequence is enabled. Defaults to true. */
  enabled?: boolean
}

/**
 * SolidJS primitive for registering a keyboard shortcut sequence (Vim-style).
 *
 * This primitive allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * @param sequence - Array of hotkey strings that form the sequence (or accessor function)
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior (or accessor function)
 *
 * @example
 * ```tsx
 * function VimEditor() {
 *   // 'g g' to go to top
 *   createHotkeySequence(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 *
 *   // 'd d' to delete line
 *   createHotkeySequence(['D', 'D'], () => {
 *     deleteLine()
 *   })
 *
 *   // 'd i w' to delete inner word
 *   createHotkeySequence(['D', 'I', 'W'], () => {
 *     deleteInnerWord()
 *   }, { timeout: 500 })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function createHotkeySequence(
  sequence: HotkeySequence | (() => HotkeySequence),
  callback: HotkeyCallback,
  options:
    | CreateHotkeySequenceOptions
    | (() => CreateHotkeySequenceOptions) = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions()

  createEffect(() => {
    // Resolve reactive values
    const resolvedSequence =
      typeof sequence === 'function' ? sequence() : sequence
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkeySequence,
      ...resolvedOptions,
    } as CreateHotkeySequenceOptions

    const { enabled = true, ...sequenceOptions } = mergedOptions

    if (!enabled || resolvedSequence.length === 0) {
      return
    }

    const manager = getSequenceManager()

    // Build options object conditionally to avoid overwriting manager defaults with undefined
    const registerOptions: SequenceOptions = { enabled: true }
    if (sequenceOptions.timeout !== undefined)
      registerOptions.timeout = sequenceOptions.timeout
    if (sequenceOptions.platform !== undefined)
      registerOptions.platform = sequenceOptions.platform

    const unregister = manager.register(
      resolvedSequence,
      callback,
      registerOptions,
    )

    onCleanup(unregister)
  })
}
