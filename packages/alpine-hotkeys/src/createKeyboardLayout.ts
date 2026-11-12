import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createKeyboardLayout(scope: HotkeysScope) {
  const layout = scope.select(
    getKeyboardLayoutStore(),
    (layoutMap) => layoutMap,
  )
  const enabled = () => scope.defaultOptions().keyboardLayout !== false
  let stop: (() => void) | undefined
  // Runs again when a defaults getter changes `keyboardLayout`.
  scope.effect(() => {
    if (enabled()) {
      stop ??= loadKeyboardLayout()
    } else {
      stop?.()
      stop = undefined
    }
  })
  scope.addCleanup(() => stop?.())
  return {
    get value() {
      return enabled() ? layout.value : null
    },
  }
}
