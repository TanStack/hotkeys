import { formatForDisplay as coreFormatForDisplay } from '@tanstack/hotkeys'

/**
 * Formats a hotkey as a label, without the scope's platform or the user's
 * keyboard layout.
 *
 * @deprecated Use `useFormatForDisplay()` in components. It returns this
 * function with the scope's platform and the user's keyboard layout filled in.
 * Outside a component, keep calling this function and pass `platform` yourself.
 */
export const formatForDisplay: typeof coreFormatForDisplay =
  coreFormatForDisplay
