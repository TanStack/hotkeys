import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { HotkeysDevtoolsPanel } from './VueHotkeysDevtools'
import type { HotkeysDevtoolsVueInit } from './VueHotkeysDevtools'

/** A plugin for `TanStackDevtools` from `@tanstack/vue-devtools`. */
export interface HotkeysDevtoolsVuePlugin {
  name: string
  component: typeof HotkeysDevtoolsPanel
  props?: HotkeysDevtoolsVueInit
}

const name = HOTKEYS_DEVTOOLS_PLUGIN_NAME

export function hotkeysDevtoolsPlugin(
  props?: HotkeysDevtoolsVueInit,
): HotkeysDevtoolsVuePlugin {
  return { name, component: HotkeysDevtoolsPanel, props }
}
