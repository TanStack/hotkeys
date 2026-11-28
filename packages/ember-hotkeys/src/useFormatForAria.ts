import { formatForAria } from '@tanstack/hotkeys'
import { bindFormatter } from './_formatter'
import type { EmberHotkeysScope } from './createHotkeysScope'

/**
 * Returns `formatForAria` with the scope's `platform` as the default. Use its
 * value for `aria-keyshortcuts`, so screen readers announce the shortcut. It
 * returns `undefined` for a multi-step sequence or no hotkey, so Glimmer omits
 * the attribute. The returned function works anywhere, including templates,
 * and reads the scope's defaults when called. An explicit `platform` option
 * wins.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded, the same way as
 * `useFormatForDisplay`. A `layoutMap` passed to the returned function wins.
 * To never ask the browser for the layout, set `keyboardLayout: false` in the
 * scope's default options.
 *
 * Server-rendered apps should set the scope's default `platform` from the
 * request user agent, such as
 * `detectPlatform(fastboot.request.headers.get('user-agent'))` with the
 * FastBoot service.
 *
 * @example
 * ```gts
 * class SearchButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
 *   formatForAria = useFormatForAria(this.args.hotkeys)
 *
 *   <template>
 *     <button aria-keyshortcuts={{this.formatForAria "Mod+K"}}>Search</button>
 *   </template>
 * }
 * ```
 */
export function useFormatForAria(
  scope?: EmberHotkeysScope,
): typeof formatForAria {
  return bindFormatter(formatForAria, scope)
}
