import * as Devtools from './SvelteHotkeysDevtools.js'
import * as NoOp from './noop.js'
import * as plugin from './plugin.js'

export const HotkeysDevtoolsPanel: typeof Devtools.HotkeysDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? NoOp.HotkeysDevtoolsPanelNoOp
    : Devtools.HotkeysDevtoolsPanel

export const hotkeysDevtoolsPlugin: typeof plugin.hotkeysDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? NoOp.hotkeysDevtoolsNoOpPlugin
    : plugin.hotkeysDevtoolsPlugin

export type { HotkeysDevtoolsSvelteInit } from './SvelteHotkeysDevtools.js'
export type { HotkeysDevtoolsSveltePlugin } from './plugin.js'
