import { getCurrentInstance, onActivated, onDeactivated, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Whether the component is shown. A component in a page cached by
 * `<KeepAlive>` is not live while the page is hidden. Always true outside a
 * component, where the hooks would warn.
 */
export function useLive(): Readonly<Ref<boolean>> {
  const live = ref(true)
  if (getCurrentInstance()) {
    onActivated(() => (live.value = true))
    onDeactivated(() => (live.value = false))
  }
  return live
}
