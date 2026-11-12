import { formatForDisplay } from '@tanstack/hotkeys'
import { namesPhysicalKey } from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectKeyboardLayout } from './injectKeyboardLayout'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call it in an injection context, such
 * as a field initializer; the returned function works anywhere, including
 * templates. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user, once the browser's keyboard layout has loaded, and
 * templates update when it arrives. See `injectKeyboardLayout`. A `layoutMap`
 * passed to the returned function wins.
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
  const layoutMap = injectKeyboardLayout()
  // Read when called, so templates track changes to the provider's platform
  // and to the layout.
  return ((hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? context.defaultOptions.platform,
      // Only a position's label follows the layout. Other labels don't read
      // it, so they don't render again when it loads.
      layoutMap:
        options?.layoutMap ??
        (namesPhysicalKey(hotkey) ? (layoutMap() ?? undefined) : undefined),
    })) as typeof formatForDisplay
}
