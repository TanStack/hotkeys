import { useEffect, useRef } from 'react'
import { getSequenceManager } from '@tanstack/keys'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/keys'

export interface UseHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'enabled'
> {
  /** Whether the sequence is enabled. Defaults to true. */
  enabled?: boolean
}

/**
 * React hook for registering a keyboard shortcut sequence (Vim-style).
 *
 * This hook allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * @param sequence - Array of hotkey strings that form the sequence
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior
 *
 * @example
 * ```tsx
 * function VimEditor() {
 *   // 'g g' to go to top
 *   useHotkeySequence(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 *
 *   // 'd d' to delete line
 *   useHotkeySequence(['D', 'D'], () => {
 *     deleteLine()
 *   })
 *
 *   // 'd i w' to delete inner word
 *   useHotkeySequence(['D', 'I', 'W'], () => {
 *     deleteInnerWord()
 *   }, { timeout: 500 })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useHotkeySequence(
  sequence: HotkeySequence,
  callback: HotkeyCallback,
  options: UseHotkeySequenceOptions = {},
): void {
  const { enabled = true, ...sequenceOptions } = options

  // Use refs to keep callback stable
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // Serialize sequence for dependency comparison
  const sequenceKey = sequence.join('|')

  useEffect(() => {
    if (!enabled || sequence.length === 0) {
      return
    }

    const manager = getSequenceManager()
    const unregister = manager.register(
      sequence,
      (event, context) => callbackRef.current(event, context),
      {
        ...sequenceOptions,
        enabled: true,
      },
    )

    return unregister
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sequenceKey, sequenceOptions.timeout, sequenceOptions.platform])
}
