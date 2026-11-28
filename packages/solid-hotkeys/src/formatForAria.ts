import { formatForAria as coreFormatForAria } from '@tanstack/hotkeys'

/**
 * Formats a hotkey for `aria-keyshortcuts`, without the provider's platform or
 * the user's keyboard layout.
 *
 * @deprecated Use `createFormatForAria()` in components. It returns this
 * function with the provider's platform and the user's keyboard layout filled
 * in. Outside a component, keep calling this function and pass `platform`
 * yourself.
 */
export const formatForAria: typeof coreFormatForAria = coreFormatForAria
