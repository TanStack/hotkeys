import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'

export interface HotkeysDevtoolsPreactInit extends DevtoolsPanelProps {}

const [HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp] =
  createPreactPanel(HotkeysDevtoolsCore)

export { HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp }
