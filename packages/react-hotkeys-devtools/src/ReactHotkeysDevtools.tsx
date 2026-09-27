import { createElement } from 'react'
import { createReactPanel } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'
import type { JSX } from 'react'

export interface HotkeysDevtoolsReactInit extends Partial<DevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props: HotkeysDevtoolsReactInit,
) => JSX.Element

const panels = createReactPanel(HotkeysDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props) =>
    createElement(Panel, {
      ...props,
      theme: props.theme ?? 'dark',
      devtoolsOpen: props.devtoolsOpen ?? true,
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
