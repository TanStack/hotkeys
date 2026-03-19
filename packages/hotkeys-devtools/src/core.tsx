import { constructCoreClass } from '@tanstack/devtools-utils/solid'

const loadComponent = () => import('./components/index')

export interface HotkeysDevtoolsInit {}

const [HotkeysDevtoolsCore, HotkeysDevtoolsCoreNoOp] =
  constructCoreClass(loadComponent)

export { HotkeysDevtoolsCore, HotkeysDevtoolsCoreNoOp }
