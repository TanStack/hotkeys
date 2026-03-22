import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'
import type { JSX } from 'preact'

export interface HotkeysDevtoolsPreactInit extends DevtoolsPanelProps {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsPreactInit,
) => JSX.Element

const panels = createPreactPanel(HotkeysDevtoolsCore)

export const HotkeysDevtoolsPanel: HotkeysDevtoolsPanelComponent = panels[0]
export const HotkeysDevtoolsPanelNoOp: HotkeysDevtoolsPanelComponent = panels[1]
