import { formatForAria as coreFormatForAria } from '@tanstack/hotkeys'

/**
 * Formats a hotkey for `aria-keyshortcuts`, without a controller's platform or
 * the user's keyboard layout.
 *
 * @deprecated Use `FormatForAriaController` in elements. Its `format` is
 * this function with the controller's platform and the user's keyboard layout
 * filled in. Outside an element, keep calling this function and pass `platform`
 * yourself.
 */
export const formatForAria: typeof coreFormatForAria = coreFormatForAria
