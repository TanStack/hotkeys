import * as Devtools from './AngularHotkeysDevtools'
import * as NoOp from './noop'
import * as plugin from './plugin'

export const HotkeysDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? NoOp.HotkeysDevtoolsPanelNoOp
    : Devtools.HotkeysDevtoolsPanel

export const hotkeysDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? NoOp.hotkeysDevtoolsNoOpPlugin
    : plugin.hotkeysDevtoolsPlugin

export type { HotkeysDevtoolsAngularInit } from './AngularHotkeysDevtools'
export type { HotkeysDevtoolsAngularPlugin } from './plugin'
