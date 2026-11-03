import { formatForDisplay } from '@tanstack/hotkeys'
import { scopeDefaults } from './utils'
import type { EmberHotkeysScope } from './createHotkeysScope'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the scope's `platform` as the default, so
 * labels match the user's platform. The returned function works anywhere,
 * including templates, and reads the scope's defaults when called, so
 * templates update when they change. An explicit `platform` option wins.
 *
 * Server-rendered apps should set the scope's default `platform` from the
 * request user agent, such as
 * `detectPlatform(fastboot.request.headers.get('user-agent'))` with the
 * FastBoot service.
 *
 * @example
 * ```gts
 * class SaveButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
 *   format = useFormatForDisplay(this.args.hotkeys)
 *
 *   <template><kbd>{{this.format "Mod+S"}}</kbd></template>
 * }
 * ```
 */
export function useFormatForDisplay(
  scope?: EmberHotkeysScope,
): typeof formatForDisplay {
  return ((hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
    formatForDisplay(hotkey, {
      ...options,
      platform:
        options?.platform ?? (scope && scopeDefaults.get(scope)!().platform),
    })) as typeof formatForDisplay
}
