import { onUnmounted, unref, watch } from 'vue'
import { getSequenceManager } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type { MaybeRefOrGetter } from 'vue'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'

export interface UseHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'enabled' | 'target'
> {
  /**
   * Whether the sequence is active.
   * Can be a Ref, a getter function, or a boolean value.
   * Defaults to true.
   */
  enabled?: MaybeRefOrGetter<boolean>
  /**
   * The DOM element to attach the event listener to.
   * Can be a Ref, a getter function, direct DOM element, or null.
   * Defaults to document.
   */
  target?: MaybeRefOrGetter<HTMLElement | Document | Window | null>
}

/**
 * Vue composable for registering a keyboard shortcut sequence (Vim-style).
 *
 * This composable allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * @param sequence - Array of hotkey strings that form the sequence
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHotkeySequence } from '@tanstack/vue-hotkeys'
 *
 * // 'g g' to go to top
 * useHotkeySequence(['G', 'G'], () => {
 *   scrollToTop()
 * })
 *
 * // 'd d' to delete line
 * useHotkeySequence(['D', 'D'], () => {
 *   deleteLine()
 * })
 *
 * // 'd i w' to delete inner word
 * useHotkeySequence(['D', 'I', 'W'], () => {
 *   deleteInnerWord()
 * }, { timeout: 500 })
 * </script>
 *
 * <template>
 *   <div>...</div>
 * </template>
 * ```
 */
export function useHotkeySequence(
  sequence: MaybeRefOrGetter<HotkeySequence>,
  callback: HotkeyCallback,
  options: MaybeRefOrGetter<UseHotkeySequenceOptions> = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getSequenceManager()

  let registration: SequenceRegistrationHandle | null = null

  // Watch for changes to reactive dependencies
  const stopWatcher = watch(
    () => {
      const resolvedSequence = resolveMaybeRefOrGetter(sequence)
      const resolvedOptions = resolveMaybeRefOrGetter(options)
      const mergedOptions = {
        ...defaultOptions.hotkeySequence,
        ...resolvedOptions,
      } as UseHotkeySequenceOptions
      const resolvedEnabled =
        mergedOptions.enabled === undefined
          ? undefined
          : resolveMaybeRefOrGetter(mergedOptions.enabled)
      const resolvedTarget =
        mergedOptions.target === undefined
          ? undefined
          : resolveMaybeRefOrGetter(mergedOptions.target)

      return {
        resolvedSequence,
        mergedOptions,
        resolvedEnabled,
        resolvedTarget,
      }
    },
    ({ resolvedSequence, mergedOptions, resolvedEnabled, resolvedTarget }) => {
      if (resolvedEnabled === false || resolvedSequence.length === 0) {
        return
      }

      // Resolve target
      const finalTarget =
        resolvedTarget ?? (typeof document !== 'undefined' ? document : null)

      if (!finalTarget) {
        return
      }

      // Unregister previous registration if it exists
      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }

      // Extract options without target (target is handled separately)
      const {
        target: _target,
        enabled: _enabled,
        ...restOptions
      } = mergedOptions
      const optionsWithoutTarget = {
        ...restOptions,
        ...(resolvedEnabled === undefined ? {} : { enabled: resolvedEnabled }),
      }

      // Register the sequence
      registration = manager.register(resolvedSequence, callback, {
        ...optionsWithoutTarget,
        target: finalTarget,
      })

      // Update callback and options
      if (registration.isActive) {
        registration.callback = callback
        registration.setOptions(optionsWithoutTarget)
      }
    },
    { immediate: true },
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatcher()
    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }
  })
}

function resolveMaybeRefOrGetter<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}
