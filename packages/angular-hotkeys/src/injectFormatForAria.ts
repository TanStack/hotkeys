import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter } from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectKeyboardLayout } from './injectKeyboardLayout'

/**
 * Returns `formatForAria` with the provider's `platform` as the default. Use
 * its value for `aria-keyshortcuts`, so screen readers announce the shortcut.
 * It returns `undefined` for a multi-step sequence or no hotkey, so an
 * `[attr.aria-keyshortcuts]` binding omits the attribute. Call it in an
 * injection context, such as a field initializer; the returned function works
 * anywhere, including templates. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded, and templates
 * update when it arrives. See `injectKeyboardLayout`. A `layoutMap` passed to
 * the returned function wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent, such as
 * `detectPlatform(inject(REQUEST)?.headers.get('user-agent'))`.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-search-button',
 *   template: `
 *     <button [attr.aria-keyshortcuts]="formatForAria('Mod+K')">Search</button>
 *   `,
 * })
 * export class SearchButton {
 *   formatForAria = injectFormatForAria()
 * }
 * ```
 */
export function injectFormatForAria(): typeof formatForAria {
  const context = injectHotkeysContext()
  const layoutMap = injectKeyboardLayout()
  // Read when called, so templates track changes to the provider's platform
  // and to the layout. Only a physical key reads the layout.
  return createFormatter(
    formatForAria,
    () => context.defaultOptions.platform,
    () => layoutMap(),
  )
}
