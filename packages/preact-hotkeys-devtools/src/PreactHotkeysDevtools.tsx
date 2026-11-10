import { createPreactPanel } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools/production'
import { Component, h } from 'preact'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'
import type { JSX } from 'preact'

export interface HotkeysDevtoolsPreactInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsPreactInit,
) => JSX.Element

const panels = createPreactPanel(HotkeysDevtoolsCore)

function withDefaults(
  CorePanel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  // `CorePanel` remounts the devtools whenever it renders with a new props
  // object. Skip renders that don't change the props, so the panel keeps its
  // search, selection and width when the parent re-renders. This avoids
  // `memo` from `preact/compat`, which changes global Preact options.
  class Panel extends Component<HotkeysDevtoolsPanelProps> {
    override shouldComponentUpdate(next: HotkeysDevtoolsPanelProps) {
      return (
        next.theme !== this.props.theme ||
        next.devtoolsOpen !== this.props.devtoolsOpen
      )
    }
    override render() {
      return h(CorePanel, this.props)
    }
  }
  return (props = {}) =>
    h(Panel, {
      ...props,
      theme: props.theme ?? 'dark',
      devtoolsOpen: props.devtoolsOpen ?? true,
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
