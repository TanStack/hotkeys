import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import type {
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'
import type { ResolvedTarget, Target } from './HotkeysCtx'

export interface CreateHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'target'
> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a Svelte ref, direct DOM element, or null.
   * Defaults to document.
   */
  target?: Target
}

function resolveTarget(target: Target): ResolvedTarget {
  if (typeof target === 'function') {
    return target() ?? null
  }
  return target
}

/**
 * Svelte function for registering a keyboard shortcut sequence (Vim-style).
 *
 * This hook allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * @param sequence - Array of hotkey strings that form the sequence
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeySequence } from '@tanstack/svelte-hotkeys'
 *
 *   // Scroll to top when 'G G' is pressed
 *   createHotkeySequence(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 *
 *   // Delete line when 'D D' is pressed
 *   createHotkeySequence(['D', 'D'], () => {
 *     deleteLine()
 *   })
 *
 *   // Delete inner word when 'D I W' is pressed
 *   createHotkeySequence(['D', 'I', 'W'], () => {
 *     deleteInnerWord()
 *   }, { timeout: 500 })
 * </script>
 *
 * <div>
 *   ....
 * </div>
 * ```
 */
export function createHotkeySequence(
  sequence: HotkeySequence,
  callback: HotkeyCallback,
  options: CreateHotkeySequenceOptions = {},
): void {
  const mergedOptions = {
    ...getDefaultHotkeysOptions().hotkeySequence,
    ...options,
  } as CreateHotkeySequenceOptions

  const manager = getSequenceManager()

  // Stable ref for registration handle
  let registrationRef: SequenceRegistrationHandle | null = null

  // Refs to capture current values for use in effect without adding dependencies
  let callbackRef = callback
  let optionsRef = mergedOptions

  $effect(() => {
    callbackRef = callback
    optionsRef = mergedOptions
  })

  // Track previous target and sequence to detect changes requiring re-registration
  let prevTargetRef: ResolvedTarget = null
  let prevSequenceRef: string | null = null

  // Normalize to hotkey sequence string (join with spaces)
  const hotkeySequenceString = $derived.by(() => formatHotkeySequence(sequence))

  // Extract options without target (target is handled separately)
  const { target: _target, ...optionsWithoutTarget } = $derived(mergedOptions)

  $effect(() => {
    if (sequence.length === 0) {
      return
    }

    // Resolve target inside the effect so refs are already attached after mount
    const resolvedTarget = optionsRef.target
      ? resolveTarget(optionsRef.target)
      : typeof document !== 'undefined'
        ? document
        : null

    // Skip if no valid target (SSR or ref still null)
    if (!resolvedTarget) {
      return
    }

    // Check if we need to re-register (target or sequence changed)
    const targetChanged =
      prevTargetRef !== null && prevTargetRef !== resolvedTarget
    const sequenceChanged =
      prevSequenceRef !== null && prevSequenceRef !== hotkeySequenceString

    // If we have an active registration and target/sequence changed, unregister first
    if (registrationRef?.isActive && (targetChanged || sequenceChanged)) {
      registrationRef.unregister()
      registrationRef = null
    }

    // Register if needed (no active registration)
    if (!registrationRef || !registrationRef.isActive) {
      registrationRef = manager.register(sequence, callback, {
        ...optionsRef,
        target: resolvedTarget,
      })
    }

    // Update tracking refs
    prevTargetRef = resolvedTarget
    prevSequenceRef = hotkeySequenceString

    // Cleanup on unmount
    return () => {
      if (registrationRef?.isActive) {
        registrationRef.unregister()
        registrationRef = null
      }
    }
  })

  // Sync callback and options on EVERY render
  $effect(() => {
    if (registrationRef?.isActive) {
      registrationRef.callback = (
        event: KeyboardEvent,
        context: HotkeyCallbackContext,
      ) => callbackRef(event, context)
      registrationRef.setOptions(optionsWithoutTarget)
    }
  })
}
