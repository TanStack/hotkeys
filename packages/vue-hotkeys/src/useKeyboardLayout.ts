import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import {
  getCurrentInstance,
  onMounted,
  shallowReadonly,
  shallowRef,
  watch,
} from 'vue'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/**
 * Vue composable that returns a ref of the browser's keyboard layout, or
 * `null` until it loads and in browsers that don't report one. The layout maps
 * each physical code to the character it types, such as `KeyQ` to `a` on a
 * French AZERTY keyboard. Only Chromium browsers report one.
 *
 * The layout loads after the first component that uses this composable
 * mounts, so server-rendered output hydrates unchanged. `useFormatForDisplay`
 * uses this composable, so you only need it for labels you draw yourself.
 *
 * To never ask the browser for the layout, set `keyboardLayout: false` in
 * `HotkeysProvider`'s `defaultOptions`. The ref then holds `null`.
 *
 * @returns Read-only reactive ref of the keyboard layout, or `null`
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useKeyboardLayout } from '@tanstack/vue-hotkeys'
 *
 * const layoutMap = useKeyboardLayout()
 * const label = (code: string) =>
 *   (layoutMap.value?.get(code) ?? code).toUpperCase()
 * </script>
 *
 * <template>
 *   <kbd>{{ label('KeyW') }}</kbd>
 * </template>
 * ```
 */
export function useKeyboardLayout(): Readonly<Ref<KeyboardLayoutMap | null>> {
  const layout = shallowRef<KeyboardLayoutMap | null>(null)
  // Server HTML never has a layout. Vue never disposes component scopes on
  // the server, so nothing subscribes there either.
  if (typeof document === 'undefined') return shallowReadonly(layout)
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const enabled = () => defaultOptions().keyboardLayout !== false
  const store = getKeyboardLayoutStore()
  // Loads the layout and follows the store while the provider allows it.
  const follow = () => {
    watch(
      enabled,
      (on, _, onCleanup) => {
        layout.value = on ? store.get() : null
        if (!on) return
        const stop = loadKeyboardLayout()
        const { unsubscribe } = store.subscribe((next) => {
          layout.value = next
        })
        onCleanup(() => {
          unsubscribe()
          stop()
        })
      },
      { immediate: true },
    )
  }
  const instance = getCurrentInstance()
  // Outside a component, and in one that has mounted, there is no mount to
  // wait for.
  if (!instance || instance.isMounted) {
    follow()
    return shallowReadonly(layout)
  }
  // A component that hydrates must first render what the server rendered,
  // even when the layout has already loaded. Vue has no public way to tell
  // hydration from a first mount, so every component starts without a layout
  // and gets it when it mounts, before the browser paints.
  onMounted(follow)
  return shallowReadonly(layout)
}
