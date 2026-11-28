import { createFormatter } from '@tanstack/hotkeys/adapter'
import {
  layoutEnabled,
  requestLayout,
  trackedLayout,
  untilRendered,
} from './keyboardLayout'
import { scopeDefaults } from './utils'
import type { EmberHotkeysScope } from './createHotkeysScope'

/**
 * `format`, such as `formatForDisplay`, bound to the scope's `platform` and the
 * keyboard layout. The layout loads after the render in which the formatter
 * first reads it, unless the scope sets `keyboardLayout: false`.
 */
export function bindFormatter<
  TFormat extends Parameters<typeof createFormatter>[0],
>(format: TFormat, scope: EmberHotkeysScope | undefined): TFormat {
  const layoutMap = untilRendered(trackedLayout)
  let requested = false
  /** The loaded layout, unless the scope turns it off. */
  const loadedLayout = () => {
    if (!layoutEnabled(scope)) {
      requested = false
      return undefined
    }
    // Formatting the first value is what loads the layout.
    if (!requested) {
      requested = true
      requestLayout()
    }
    return layoutMap() ?? undefined
  }
  // Only a position's value reads the layout, so other values don't render
  // again when it loads.
  return createFormatter(
    format,
    () => scope && scopeDefaults.get(scope)!().platform,
    loadedLayout,
  )
}
