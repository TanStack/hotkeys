import { onUnmounted, unref, watch } from 'vue'
import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type { UseHotkeyOptions } from './useHotkey'
import type {
  HotkeyCallback,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeRefOrGetter } from 'vue'

/**
 * A single hotkey definition for use with `useHotkeys`.
 */
export interface UseHotkeyDefinition {
  /** The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object */
  hotkey: MaybeRefOrGetter<RegisterableHotkey>
  /** The function to call when the hotkey is pressed */
  callback: HotkeyCallback
  /** Per-hotkey options (merged on top of commonOptions) */
  options?: MaybeRefOrGetter<UseHotkeyOptions>
}

/**
 * Vue composable for registering multiple keyboard hotkeys at once.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * Accepts a dynamic array of hotkey definitions, making it safe to use
 * with variable-length lists.
 *
 * Options are merged in this order:
 * HotkeysProvider defaults < commonOptions < per-definition options
 *
 * @param hotkeys - Array of hotkey definitions to register, or a getter/ref
 * @param commonOptions - Shared options applied to all hotkeys (overridden by per-definition options)
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHotkeys } from '@tanstack/vue-hotkeys'
 *
 * useHotkeys([
 *   { hotkey: 'Mod+S', callback: () => save() },
 *   { hotkey: 'Mod+Z', callback: () => undo() },
 *   { hotkey: 'Escape', callback: () => close() },
 * ])
 * </script>
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { computed } from 'vue'
 * import { useHotkeys } from '@tanstack/vue-hotkeys'
 *
 * const items = computed(() => [...])
 * // Dynamic hotkeys from reactive data
 * useHotkeys(
 *   () => items.value.map((item) => ({
 *     hotkey: item.shortcut,
 *     callback: item.action,
 *     options: { enabled: item.enabled },
 *   })),
 *   { preventDefault: true },
 * )
 * </script>
 * ```
 */
export function useHotkeys(
  hotkeys: MaybeRefOrGetter<Array<UseHotkeyDefinition>>,
  commonOptions: MaybeRefOrGetter<UseHotkeyOptions> = {},
): void {
  type RegistrationRecord = {
    handle: HotkeyRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getHotkeyManager()

  const registrations = new Map<string, RegistrationRecord>()

  const stopWatcher = watch(
    () => {
      const resolvedHotkeys = resolveMaybeRefOrGetter(hotkeys)
      const resolvedCommonOptions = resolveMaybeRefOrGetter(commonOptions)

      return resolvedHotkeys.map((def, i) => {
        const resolvedHotkey = resolveMaybeRefOrGetter(def.hotkey)
        const resolvedDefOptions = def.options
          ? resolveMaybeRefOrGetter(def.options)
          : {}

        const mergedOptions = {
          ...defaultOptions.hotkey,
          ...resolvedCommonOptions,
          ...resolvedDefOptions,
        } as UseHotkeyOptions

        const platform = mergedOptions.platform ?? detectPlatform()
        const hotkeyString = normalizeRegisterableHotkey(
          resolvedHotkey,
          platform,
        )

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
          hotkeyString,
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
        const finalTarget =
          entry.resolvedTarget ??
          (typeof document !== 'undefined' ? document : null)

        if (!finalTarget) {
          continue
        }

        const registrationKey = `${entry.index}:${entry.hotkeyString}`
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

        const handle = manager.register(entry.hotkeyString, entry.callback, {
          ...optionsWithoutTarget,
          target: finalTarget,
        })
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
