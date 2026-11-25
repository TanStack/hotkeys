import * as Devtools from './VueHotkeysDevtools'
import * as NoOp from './noop'
import * as plugin from './plugin'

export const HotkeysDevtoolsPanel: typeof Devtools.HotkeysDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? NoOp.HotkeysDevtoolsPanelNoOp
    : Devtools.HotkeysDevtoolsPanel

export const hotkeysDevtoolsPlugin: typeof plugin.hotkeysDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? NoOp.hotkeysDevtoolsNoOpPlugin
    : plugin.hotkeysDevtoolsPlugin

export type { HotkeysDevtoolsVueInit } from './VueHotkeysDevtools'
export type { HotkeysDevtoolsVuePlugin } from './plugin'
