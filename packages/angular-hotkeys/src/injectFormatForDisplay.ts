import { formatForDisplay } from '@tanstack/hotkeys'
import { injectHotkeysContext } from './hotkeys-provider'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call it in an injection context, such
 * as a field initializer; the returned function works anywhere, including
 * templates. An explicit `platform` option wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent, such as
 * `detectPlatform(inject(REQUEST)?.headers.get('user-agent'))`.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-save-button',
 *   template: `<kbd>{{ format('Mod+S') }}</kbd>`,
 * })
 * export class SaveButton {
 *   format = injectFormatForDisplay()
 * }
 * ```
 */
export function injectFormatForDisplay(): typeof formatForDisplay {
  const context = injectHotkeysContext()
  // Read when called, so templates track changes to the provider's platform.
  return ((hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? context.defaultOptions.platform,
    })) as typeof formatForDisplay
}
