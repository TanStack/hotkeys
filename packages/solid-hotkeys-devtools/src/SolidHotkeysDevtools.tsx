import { createComponent, mergeProps } from 'solid-js'
import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { ClassType } from '@tanstack/devtools-utils/solid'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools'
import type { JSX } from 'solid-js'

export interface HotkeysDevtoolsSolidInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsSolidInit,
) => JSX.Element

// `createSolidPanel` wants the exact class type from `constructCoreClass`.
const panels = createSolidPanel(HotkeysDevtoolsCore as unknown as ClassType)

function withDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props = {}) =>
    createComponent(
      Panel,
      mergeProps({ theme: 'dark' as const, devtoolsOpen: true }, props),
    )
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
