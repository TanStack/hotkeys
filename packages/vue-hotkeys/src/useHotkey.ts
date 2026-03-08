import { onUnmounted, unref, watch } from 'vue'
import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeRefOrGetter } from 'vue'

export interface UseHotkeyOptions extends Omit<
  HotkeyOptions,
  'enabled' | 'target'
> {
  /**
   * Whether the hotkey is active.
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
 * Vue composable for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This composable automatically tracks reactive dependencies and updates
 * the registration when options or the callback change.
 *
 * @param hotkey - The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object (supports `mod` for cross-platform)
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useHotkey } from '@tanstack/vue-hotkeys'
 *
 * const count = ref(0)
 *
 * // Callback always has access to latest count value
 * useHotkey('Mod+S', (event, { hotkey }) => {
 *   console.log(`Save triggered, count is ${count.value}`)
 *   handleSave()
 * })
 * </script>
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useHotkey } from '@tanstack/vue-hotkeys'
 *
 * const isOpen = ref(false)
 *
 * // enabled option is reactive
 * useHotkey('Escape', () => {
 *   isOpen.value = false
 * }, { enabled: isOpen })
 * </script>
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useHotkey } from '@tanstack/vue-hotkeys'
 *
 * const editorRef = ref<HTMLDivElement | null>(null)
 *
 * // Scoped to a specific element
 * useHotkey('Mod+S', () => {
 *   save()
 * }, { target: editorRef })
 * </script>
 *
 * <template>
 *   <div ref="editorRef">...</div>
 * </template>
 * ```
 */
export function useHotkey(
  hotkey: MaybeRefOrGetter<RegisterableHotkey>,
  callback: HotkeyCallback,
  options: MaybeRefOrGetter<UseHotkeyOptions> = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getHotkeyManager()

  let registration: HotkeyRegistrationHandle | null = null

  // Watch for changes to reactive dependencies
  const stopWatcher = watch(
    () => {
      const resolvedHotkey = resolveMaybeRefOrGetter(hotkey)
      const resolvedOptions = resolveMaybeRefOrGetter(options)
      const mergedOptions = {
        ...defaultOptions.hotkey,
        ...resolvedOptions,
      } as UseHotkeyOptions
      const resolvedEnabled =
        mergedOptions.enabled === undefined
          ? undefined
          : resolveMaybeRefOrGetter(mergedOptions.enabled)
      const resolvedTarget =
        mergedOptions.target === undefined
          ? undefined
          : resolveMaybeRefOrGetter(mergedOptions.target)

      return {
        resolvedHotkey,
        mergedOptions,
        resolvedEnabled,
        resolvedTarget,
      }
    },
    ({ resolvedHotkey, mergedOptions, resolvedEnabled, resolvedTarget }) => {
      // Normalize to hotkey string
      const platform = mergedOptions.platform ?? detectPlatform()
      const hotkeyString: Hotkey =
        typeof resolvedHotkey === 'string'
          ? resolvedHotkey
          : (formatHotkey(
              rawHotkeyToParsedHotkey(resolvedHotkey as any, platform),
            ) as Hotkey)

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

      // Register the hotkey
      registration = manager.register(hotkeyString, callback, {
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
