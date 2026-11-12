import { formatForDisplay as coreFormatForDisplay } from '@tanstack/hotkeys'

/**
 * Formats a hotkey as a label, without a controller's platform or the user's
 * keyboard layout.
 *
 * @deprecated Use `FormatForDisplayController` in elements. Its `format` is
 * this function with the controller's platform and the user's keyboard layout
 * filled in. Outside an element, keep calling this function and pass `platform`
 * yourself.
 */
export const formatForDisplay: typeof coreFormatForDisplay =
  coreFormatForDisplay
