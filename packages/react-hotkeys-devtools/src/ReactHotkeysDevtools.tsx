import { createReactPanel } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools/production'
import { createElement, memo } from 'react'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'
import type { ReactElement } from 'react'

export interface HotkeysDevtoolsReactInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsReactInit,
) => ReactElement

const panels = createReactPanel(HotkeysDevtoolsCore)

function withDefaults(
  CorePanel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  // `CorePanel` remounts the devtools whenever it renders with a new props
  // object. Skip renders that don't change the props, so the panel keeps its
  // search, selection and width when the parent re-renders.
  const Panel = memo(CorePanel)
  return (props = {}) =>
    createElement(Panel, {
      ...props,
      theme: props.theme ?? 'dark',
      devtoolsOpen: props.devtoolsOpen ?? true,
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
