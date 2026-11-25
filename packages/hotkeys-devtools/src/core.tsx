import { constructCoreClass } from '@tanstack/devtools-utils/solid'
import type { HotkeysDevtoolsCoreClass } from './types'

const loadComponent = () => import('./components/index')

export interface HotkeysDevtoolsInit {}

// The no-op class is in `./noop`, so production bundles can drop this module.
const [DevtoolsCore] = constructCoreClass(loadComponent)

export const HotkeysDevtoolsCore: HotkeysDevtoolsCoreClass = DevtoolsCore
