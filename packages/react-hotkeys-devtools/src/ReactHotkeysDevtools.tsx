import { createElement } from 'react'
import { createReactPanel } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { ReactElement } from 'react'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools'

export interface HotkeysDevtoolsReactInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsReactInit,
) => ReactElement

const panels = createReactPanel(HotkeysDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  return (props = {}) =>
    createElement(Panel, {
      ...props,
      theme: props.theme ?? 'dark',
      devtoolsOpen: props.devtoolsOpen ?? true,
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
