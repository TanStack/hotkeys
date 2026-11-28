import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys, createFormatter } from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectHotkeyRegistrations } from './injectHotkeyRegistrations'
import { injectKeyboardLayout } from './injectKeyboardLayout'

/**
 * Returns `formatForAria` with the provider's `platform` as the default. Use
 * its value for `aria-keyshortcuts`, so screen readers announce the shortcut.
 * It returns `undefined` for a multi-step sequence, no hotkey, or a hotkey
 * that can't fire right now (one that is disabled, in a suspended scope, a
 * suspended character key, or not registered), so an
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
  const registrations = injectHotkeyRegistrations()
  // Read when called, so templates track changes to the provider's platform,
  // the layout, and the registrations. Only a physical key reads the layout.
  return announceLiveHotkeys(
    createFormatter(
      formatForAria,
      () => context.defaultOptions.platform,
      () => layoutMap(),
    ),
    () => registrations(),
  )
}
