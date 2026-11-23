import { createFormatForDisplay } from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectKeyboardLayout } from './injectKeyboardLayout'
import type { formatForDisplay } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call it in an injection context, such
 * as a field initializer; the returned function works anywhere, including
 * templates. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded, and templates update when it arrives. See `injectKeyboardLayout`. A
 * `layoutMap` passed to the returned function wins. Firefox and Safari report
 * no layout, so labels there keep the key's US character.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent, such as
 * `detectPlatform(inject(REQUEST)?.headers.get('user-agent'))`.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-save-button',
 *   template: `<kbd>{{ formatForDisplay('Mod+S') }}</kbd>`,
 * })
 * export class SaveButton {
 *   formatForDisplay = injectFormatForDisplay()
 * }
 * ```
 */
export function injectFormatForDisplay(): typeof formatForDisplay {
  const context = injectHotkeysContext()
  const layoutMap = injectKeyboardLayout()
  // Read when called, so templates track changes to the provider's platform
  // and to the layout.
  // Only a position's label reads the layout, so other labels don't render
  // again when it loads.
  return createFormatForDisplay(
    () => context.defaultOptions.platform,
    () => layoutMap(),
  )
}
