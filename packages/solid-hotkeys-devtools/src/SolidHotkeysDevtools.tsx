import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'

export interface HotkeysDevtoolsSolidInit extends DevtoolsPanelProps {}

const [HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp] =
  createSolidPanel(HotkeysDevtoolsCore)

export { HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp }
