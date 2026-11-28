import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys } from '@tanstack/hotkeys/adapter'
import { bindFormatter } from './_formatter'
import { trackedRegistrationViews } from './_registrations'
import type { EmberHotkeysScope } from './createHotkeysScope'

/**
 * Returns `formatForAria` with the scope's `platform` as the default. Use its
 * value for `aria-keyshortcuts`, so screen readers announce the shortcut. It
 * returns `undefined` for a multi-step sequence, no hotkey, or a hotkey that
 * can't fire right now (one that is disabled, in a suspended scope, a
 * suspended character key, or not registered), so Glimmer omits the attribute.
 * The returned function works anywhere, including templates, and reads the
 * scope's defaults when called. An explicit `platform` option wins.
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
  // Every value reads the registrations, so it follows whether the hotkey
  // can fire.
  return announceLiveHotkeys(
    bindFormatter(formatForAria, scope),
    trackedRegistrationViews,
  )
}
