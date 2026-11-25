'use client'

import * as Devtools from './core'
import { HotkeysDevtoolsCoreNoOp } from './noop'
import type { HotkeysDevtoolsCoreClass } from './types'

export const HotkeysDevtoolsCore: HotkeysDevtoolsCoreClass =
  process.env.NODE_ENV !== 'development'
    ? HotkeysDevtoolsCoreNoOp
    : Devtools.HotkeysDevtoolsCore

export {
  HOTKEYS_DEVTOOLS_DEFAULT_PROPS,
  HOTKEYS_DEVTOOLS_PLUGIN_NAME,
} from './constants'
export type { HotkeysDevtoolsInit } from './core'
export type {
  HotkeysDevtoolsCoreClass,
  HotkeysDevtoolsPanelProps,
  HotkeysDevtoolsRenderPlugin,
  HotkeysDevtoolsTheme,
} from './types'
