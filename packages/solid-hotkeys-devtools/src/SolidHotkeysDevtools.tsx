import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import {
  HOTKEYS_DEVTOOLS_DEFAULT_PROPS,
  HotkeysDevtoolsCore,
} from '@tanstack/hotkeys-devtools/production'
import { createComponent, mergeProps } from 'solid-js'
import type { ClassType } from '@tanstack/devtools-utils/solid'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'
import type { JSX } from 'solid-js'

export interface HotkeysDevtoolsSolidInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsSolidInit,
) => JSX.Element

// `createSolidPanel` wants the exact class type from `constructCoreClass`.
const panels = createSolidPanel(HotkeysDevtoolsCore as unknown as ClassType)

function withPanelDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props = {}) =>
    createComponent(Panel, mergeProps(HOTKEYS_DEVTOOLS_DEFAULT_PROPS, props))
}

export const HotkeysDevtoolsPanel = withPanelDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withPanelDefaults(panels[1])
