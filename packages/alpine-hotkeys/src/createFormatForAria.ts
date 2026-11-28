import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys, createFormatter } from '@tanstack/hotkeys/adapter'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import { createKeyboardLayout } from './createKeyboardLayout'
import type { HotkeysScope } from './scope'

export function createFormatForAria(scope: HotkeysScope): typeof formatForAria {
  const layout = createKeyboardLayout(scope)
  const registrations = createHotkeyRegistrations(scope)
  // Only a physical key reads the layout, so other values don't run again
  // when it loads. Every value reads the registrations, so it follows whether
  // the hotkey can fire.
  return announceLiveHotkeys(
    createFormatter(
      formatForAria,
      () => scope.defaultOptions().platform,
      () => layout.value,
    ),
    () => registrations.hotkeys,
  )
}
