import { formatForDisplay as coreFormatForDisplay } from '@tanstack/hotkeys'

/**
 * Formats a hotkey as a label, without the provider's platform or the user's
 * keyboard layout.
 *
 * @deprecated Use `injectFormatForDisplay()` in an injection context, such as a
 * component's field initializer. It returns this function with the provider's
 * platform and the user's keyboard layout filled in. Outside an injection
 * context, keep calling this function and pass `platform` yourself.
 */
export const formatForDisplay: typeof coreFormatForDisplay =
  coreFormatForDisplay
