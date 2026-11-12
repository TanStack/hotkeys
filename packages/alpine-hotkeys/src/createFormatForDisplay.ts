import { formatForDisplay } from '@tanstack/hotkeys'
import { namesPhysicalKey } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createFormatForDisplay(
  scope: HotkeysScope,
): typeof formatForDisplay {
  const layout = createKeyboardLayout(scope)
  return ((hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? scope.defaultOptions().platform,
      // Only a position's label follows the layout. Other labels don't read
      // it, so they don't run again when it loads.
      layoutMap:
        options?.layoutMap ??
        (namesPhysicalKey(hotkey) ? (layout.value ?? undefined) : undefined),
    })) as typeof formatForDisplay
}
