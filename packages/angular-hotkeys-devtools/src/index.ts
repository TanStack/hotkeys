import * as Devtools from './AngularHotkeysDevtools'
import * as plugin from './plugin'

export const HotkeysDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? Devtools.HotkeysDevtoolsPanelNoOp
    : Devtools.HotkeysDevtoolsPanel

export const hotkeysDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.hotkeysDevtoolsNoOpPlugin
    : plugin.hotkeysDevtoolsPlugin

export type { HotkeysDevtoolsAngularInit } from './AngularHotkeysDevtools'
