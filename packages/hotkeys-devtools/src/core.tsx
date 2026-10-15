import { constructCoreClass } from '@tanstack/devtools-utils/solid'
import type { ClassType } from '@tanstack/devtools-utils/solid'

const loadComponent = () => import('./components/index')

export interface HotkeysDevtoolsInit {}

const coreClasses = constructCoreClass(loadComponent)

export const HotkeysDevtoolsCore: ClassType = coreClasses[0]
export const HotkeysDevtoolsCoreNoOp: ClassType = coreClasses[1]
