'use client'

import * as Devtools from './core'
import type { HotkeysDevtoolsCoreClass } from './types'

export const HotkeysDevtoolsCore: HotkeysDevtoolsCoreClass =
  process.env.NODE_ENV !== 'development'
    ? Devtools.HotkeysDevtoolsCoreNoOp
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
