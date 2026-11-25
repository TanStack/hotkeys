import * as Devtools from './PreactHotkeysDevtools'
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

export type { HotkeysDevtoolsPreactInit } from './PreactHotkeysDevtools'
export type { HotkeysDevtoolsPreactPlugin } from './plugin'
