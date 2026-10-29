import { constructCoreClass } from '@tanstack/devtools-utils/solid'
import type { HotkeysDevtoolsCoreClass } from './types'

const loadComponent = () => import('./components/index')

export interface HotkeysDevtoolsInit {}

const coreClasses = constructCoreClass(loadComponent)

export const HotkeysDevtoolsCore: HotkeysDevtoolsCoreClass = coreClasses[0]
export const HotkeysDevtoolsCoreNoOp: HotkeysDevtoolsCoreClass = coreClasses[1]
