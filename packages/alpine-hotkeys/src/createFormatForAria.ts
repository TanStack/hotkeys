import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import type { HotkeysScope } from './scope'

export function createFormatForAria(scope: HotkeysScope): typeof formatForAria {
  const layout = createKeyboardLayout(scope)
  // Only a physical key reads the layout, so other values don't run again
  // when it loads.
  return createFormatter(
    formatForAria,
    () => scope.defaultOptions().platform,
    () => layout.value,
  )
}
