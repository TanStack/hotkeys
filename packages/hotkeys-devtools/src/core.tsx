import { constructCoreClass } from '@tanstack/devtools-utils/solid'

const loadComponent = () => import('./HotkeysDevtools')

export interface HotkeysDevtoolsInit {}

const [HotkeysDevtoolsCore, HotkeysDevtoolsCoreNoOp] =
  constructCoreClass(loadComponent)

export { HotkeysDevtoolsCore, HotkeysDevtoolsCoreNoOp }
