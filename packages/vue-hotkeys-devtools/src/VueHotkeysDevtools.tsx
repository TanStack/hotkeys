import { createVuePanel } from '@tanstack/devtools-utils/vue'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/vue'

export interface HotkeysDevtoolsVueInit extends DevtoolsPanelProps {}

type DevtoolsPanelConstructor = new (props: DevtoolsPanelProps) => {
  mount: (el: HTMLElement, props?: DevtoolsPanelProps) => void
  unmount: () => void
}

const [HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp] = createVuePanel(
  HotkeysDevtoolsCore as unknown as DevtoolsPanelConstructor,
)

export { HotkeysDevtoolsPanel, HotkeysDevtoolsPanelNoOp }
