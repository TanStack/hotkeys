import { createFormatForDisplay as createFormat } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import type { formatForDisplay } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createFormatForDisplay(
  scope: HotkeysScope,
): typeof formatForDisplay {
  const layout = createKeyboardLayout(scope)
  // Only a position's label reads the layout, so other labels don't run again
  // when it loads.
  return createFormat(
    () => scope.defaultOptions().platform,
    () => layout.value,
  )
}
