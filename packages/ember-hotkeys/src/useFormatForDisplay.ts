import { createFormatForDisplay } from '@tanstack/hotkeys/adapter'
import {
  layoutEnabled,
  requestLayout,
  trackedLayout,
  untilRendered,
} from './keyboardLayout'
import { scopeDefaults } from './utils'
import type { formatForDisplay } from '@tanstack/hotkeys'
import type { EmberHotkeysScope } from './createHotkeysScope'

/**
 * Returns `formatForDisplay` with the scope's `platform` as the default, so
 * labels match the user's platform. The returned function works anywhere,
 * including templates, and reads the scope's defaults when called, so
 * templates update when they change. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded. The returned function reads the layout from the browser after the
 * render in which it first formats a label. It has no owner, so it doesn't read
 * the layout again when the window regains focus: see `useKeyboardLayout` for
 * that. A `layoutMap` passed to the returned function wins. To never ask the
 * browser for the layout, set `keyboardLayout: false` in the scope's default
 * options. Firefox and Safari report no layout, so labels there keep the key's
 * US character.
 *
 * Server-rendered apps should set the scope's default `platform` from the
 * request user agent, such as
 * `detectPlatform(fastboot.request.headers.get('user-agent'))` with the
 * FastBoot service.
 *
 * @example
 * ```gts
 * class SaveButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
 *   formatForDisplay = useFormatForDisplay(this.args.hotkeys)
 *
 *   <template><kbd>{{this.formatForDisplay "Mod+S"}}</kbd></template>
 * }
 * ```
 */
export function useFormatForDisplay(
  scope?: EmberHotkeysScope,
): typeof formatForDisplay {
  const layoutMap = untilRendered(trackedLayout)
  let requested = false
  /** The loaded layout, unless the scope turns it off. */
  const loadedLayout = () => {
    if (!layoutEnabled(scope)) {
      requested = false
      return undefined
    }
    // Formatting the first label is what loads the layout.
    if (!requested) {
      requested = true
      requestLayout()
    }
    return layoutMap() ?? undefined
  }
  // Only a position's label reads the layout, so other labels don't render
  // again when it loads.
  return createFormatForDisplay(
    () => scope && scopeDefaults.get(scope)!().platform,
    loadedLayout,
  )
}
