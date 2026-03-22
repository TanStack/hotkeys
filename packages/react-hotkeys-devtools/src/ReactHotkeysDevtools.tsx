import { createReactPanel } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'
import type { JSX } from 'react'

export interface HotkeysDevtoolsReactInit extends DevtoolsPanelProps {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsReactInit,
) => JSX.Element

const panels = createReactPanel(HotkeysDevtoolsCore)

export const HotkeysDevtoolsPanel: HotkeysDevtoolsPanelComponent = panels[0]
export const HotkeysDevtoolsPanelNoOp: HotkeysDevtoolsPanelComponent = panels[1]
