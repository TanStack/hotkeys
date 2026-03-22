'use client'

import * as Devtools from './core'
import type { ClassType } from '@tanstack/devtools-utils/solid'

export const HotkeysDevtoolsCore: ClassType =
  process.env.NODE_ENV !== 'development'
    ? Devtools.HotkeysDevtoolsCoreNoOp
    : Devtools.HotkeysDevtoolsCore

export type { HotkeysDevtoolsInit } from './core'
