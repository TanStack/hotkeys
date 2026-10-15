import * as Devtools from './PreactHotkeysDevtools'
import * as plugin from './plugin'

export const HotkeysDevtoolsPanel: typeof Devtools.HotkeysDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? Devtools.HotkeysDevtoolsPanelNoOp
    : Devtools.HotkeysDevtoolsPanel

export const hotkeysDevtoolsPlugin: typeof plugin.hotkeysDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.hotkeysDevtoolsNoOpPlugin
    : plugin.hotkeysDevtoolsPlugin

export type { HotkeysDevtoolsPreactInit } from './PreactHotkeysDevtools'
