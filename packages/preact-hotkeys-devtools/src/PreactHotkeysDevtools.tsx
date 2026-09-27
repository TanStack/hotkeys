import { h } from 'preact'
import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'
import type { JSX } from 'preact'

export interface HotkeysDevtoolsPreactInit extends Partial<DevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsPreactInit,
) => JSX.Element

const panels = createPreactPanel(HotkeysDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props) =>
    h(Panel, {
      ...props,
      theme: props.theme ?? 'dark',
      devtoolsOpen: props.devtoolsOpen ?? true,
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
