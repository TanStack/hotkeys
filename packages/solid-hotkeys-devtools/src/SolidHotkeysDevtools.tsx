import { createComponent, mergeProps } from 'solid-js'
import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'
import type { JSX } from 'solid-js'

export interface HotkeysDevtoolsSolidInit extends Partial<DevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsSolidInit,
) => JSX.Element

const panels = createSolidPanel(HotkeysDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props) =>
    createComponent(
      Panel,
      mergeProps({ theme: 'dark' as const, devtoolsOpen: true }, props),
    )
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
