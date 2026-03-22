import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'
import type { JSX } from 'solid-js'

export interface HotkeysDevtoolsSolidInit extends DevtoolsPanelProps {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsSolidInit,
) => JSX.Element

const panels = createSolidPanel(HotkeysDevtoolsCore)

export const HotkeysDevtoolsPanel: HotkeysDevtoolsPanelComponent = panels[0]
export const HotkeysDevtoolsPanelNoOp: HotkeysDevtoolsPanelComponent = panels[1]
