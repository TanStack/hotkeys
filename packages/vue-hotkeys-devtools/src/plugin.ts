import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from './VueHotkeysDevtools'
import type { HotkeysDevtoolsVueInit } from './VueHotkeysDevtools'

/** A plugin for `TanStackDevtools` from `@tanstack/vue-devtools`. */
export interface HotkeysDevtoolsVuePlugin {
  name: string
  component: typeof HotkeysDevtoolsPanel
  props?: HotkeysDevtoolsVueInit
}

const name = 'TanStack Hotkeys'

export function hotkeysDevtoolsPlugin(
  props?: HotkeysDevtoolsVueInit,
): HotkeysDevtoolsVuePlugin {
  return { name, component: HotkeysDevtoolsPanel, props }
}

export function hotkeysDevtoolsNoOpPlugin(
  props?: HotkeysDevtoolsVueInit,
): HotkeysDevtoolsVuePlugin {
  return { name, component: HotkeysDevtoolsPanelNoOp, props }
}
