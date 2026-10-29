'use client'

import * as Devtools from './core'
import type { HotkeysDevtoolsCoreClass } from './types'

export const HotkeysDevtoolsCore: HotkeysDevtoolsCoreClass =
  process.env.NODE_ENV !== 'development'
    ? Devtools.HotkeysDevtoolsCoreNoOp
    : Devtools.HotkeysDevtoolsCore

export type { HotkeysDevtoolsInit } from './core'
export type {
  HotkeysDevtoolsCoreClass,
  HotkeysDevtoolsPanelProps,
  HotkeysDevtoolsTheme,
} from './types'
