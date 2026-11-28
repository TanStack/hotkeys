import { formatForAria as coreFormatForAria } from '@tanstack/hotkeys'

/**
 * Formats a hotkey for `aria-keyshortcuts`, without the scope's platform or the
 * user's keyboard layout.
 *
 * @deprecated Use `useFormatForAria()` in components. It returns this
 * function with the scope's platform and the user's keyboard layout filled in.
 * Outside a component, keep calling this function and pass `platform` yourself.
 */
export const formatForAria: typeof coreFormatForAria = coreFormatForAria
