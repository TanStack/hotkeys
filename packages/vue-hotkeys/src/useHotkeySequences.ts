import { onUnmounted, unref, watch } from 'vue'
import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type { UseHotkeySequenceOptions } from './useHotkeySequence'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'
import type { MaybeRefOrGetter } from 'vue'

/**
 * A single sequence definition for use with `useHotkeySequences`.
 */
export interface UseHotkeySequenceDefinition {
  /** Array of hotkey strings that form the sequence */
  sequence: MaybeRefOrGetter<HotkeySequence>
  /** The function to call when the sequence is completed */
  callback: HotkeyCallback
  /** Per-sequence options (merged on top of commonOptions) */
  options?: MaybeRefOrGetter<UseHotkeySequenceOptions>
}

/**
 * Vue composable for registering multiple keyboard shortcut sequences at once (Vim-style).
 *
 * Uses the singleton SequenceManager. Accepts a dynamic array of definitions, or a getter/ref
 * that returns one, so you can register variable-length lists safely.
 *
 * Options are merged in this order:
 * HotkeysProvider defaults < commonOptions < per-definition options
 *
 * Definitions with an empty `sequence` are skipped (no registration).
 *
 * @param definitions - Array of sequence definitions, or a getter/ref
 * @param commonOptions - Shared options applied to all sequences (overridden by per-definition options)
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHotkeySequences } from '@tanstack/vue-hotkeys'
 *
 * useHotkeySequences([
 *   { sequence: ['G', 'G'], callback: () => scrollToTop() },
 *   { sequence: ['D', 'D'], callback: () => deleteLine() },
 * ])
 * </script>
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { computed } from 'vue'
 * import { useHotkeySequences } from '@tanstack/vue-hotkeys'
 *
 * const items = computed(() => [...])
 * useHotkeySequences(
 *   () => items.value.map((item) => ({
 *     sequence: item.chords,
 *     callback: item.action,
 *     options: { enabled: item.enabled },
 *   })),
 *   { preventDefault: true },
 * )
 * </script>
 * ```
 */
export function useHotkeySequences(
  definitions: MaybeRefOrGetter<Array<UseHotkeySequenceDefinition>>,
  commonOptions: MaybeRefOrGetter<UseHotkeySequenceOptions> = {},
): void {
  type RegistrationRecord = {
    handle: SequenceRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getSequenceManager()

  const registrations = new Map<string, RegistrationRecord>()

  const stopWatcher = watch(
    () => {
      const resolvedDefinitions = resolveMaybeRefOrGetter(definitions)
      const resolvedCommonOptions = resolveMaybeRefOrGetter(commonOptions)

      return resolvedDefinitions.map((def, i) => {
        const resolvedSequence = resolveMaybeRefOrGetter(def.sequence)
        const resolvedDefOptions = def.options
          ? resolveMaybeRefOrGetter(def.options)
          : {}

        const mergedOptions = {
          ...defaultOptions.hotkeySequence,
          ...resolvedCommonOptions,
          ...resolvedDefOptions,
        } as UseHotkeySequenceOptions

        const sequenceString = formatHotkeySequence(resolvedSequence)

        const resolvedEnabled =
          mergedOptions.enabled === undefined
            ? undefined
            : resolveMaybeRefOrGetter(mergedOptions.enabled)
        const resolvedTarget =
          mergedOptions.target === undefined
            ? undefined
            : resolveMaybeRefOrGetter(mergedOptions.target as any)

        return {
          index: i,
          resolvedSequence,
          sequenceString,
          callback: def.callback,
          mergedOptions,
          resolvedEnabled,
          resolvedTarget,
        }
      })
    },
    (resolved) => {
      const nextKeys = new Set<string>()
      const prepared: Array<{
        registrationKey: string
        entry: (typeof resolved)[number]
        finalTarget: Document | HTMLElement | Window
      }> = []

      for (const entry of resolved) {
        if (entry.resolvedSequence.length === 0) {
          continue
        }

        const finalTarget =
          entry.resolvedTarget ??
          (typeof document !== 'undefined' ? document : null)

        if (!finalTarget) {
          continue
        }

        const registrationKey = `${entry.index}:${entry.sequenceString}`
        nextKeys.add(registrationKey)
        prepared.push({ registrationKey, entry, finalTarget })
      }

      for (const [key, record] of [...registrations.entries()]) {
        if (!nextKeys.has(key)) {
          if (record.handle.isActive) {
            record.handle.unregister()
          }
          registrations.delete(key)
        }
      }

      for (const { registrationKey, entry, finalTarget } of prepared) {
        const existing = registrations.get(registrationKey)
        if (existing?.handle.isActive && existing.target === finalTarget) {
          existing.handle.callback = entry.callback
          const {
            target: _target,
            enabled: _enabled,
            ...restOptions
          } = entry.mergedOptions
          const optionsWithoutTarget = {
            ...restOptions,
            ...(entry.resolvedEnabled === undefined
              ? {}
              : { enabled: entry.resolvedEnabled }),
          }
          existing.handle.setOptions(optionsWithoutTarget)
          continue
        }

        if (existing) {
          if (existing.handle.isActive) {
            existing.handle.unregister()
          }
          registrations.delete(registrationKey)
        }

        const {
          target: _target,
          enabled: _enabled,
          ...restOptions
        } = entry.mergedOptions
        const optionsWithoutTarget = {
          ...restOptions,
          ...(entry.resolvedEnabled === undefined
            ? {}
            : { enabled: entry.resolvedEnabled }),
        }

        const handle = manager.register(
          entry.resolvedSequence,
          entry.callback,
          {
            ...optionsWithoutTarget,
            target: finalTarget,
          },
        )
        registrations.set(registrationKey, { handle, target: finalTarget })
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stopWatcher()
    for (const { handle } of registrations.values()) {
      if (handle.isActive) {
        handle.unregister()
      }
    }
    registrations.clear()
  })
}

function resolveMaybeRefOrGetter<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}
