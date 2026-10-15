import { createAngularPanel } from '@tanstack/devtools-utils/angular'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools/production'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/angular'

export interface HotkeysDevtoolsAngularInit extends Partial<DevtoolsPanelProps> {}

const [createPanel, HotkeysDevtoolsPanelNoOp] =
  createAngularPanel(HotkeysDevtoolsCore)

// Angular Devtools distinguishes render factories from components by prototype.
export const HotkeysDevtoolsPanel = () => {
  const render = createPanel()
  return (inputs: () => HotkeysDevtoolsAngularInit, host: HTMLElement) =>
    render(() => {
      const props = inputs()
      return {
        ...props,
        theme: props.theme ?? 'dark',
        devtoolsOpen: props.devtoolsOpen ?? true,
      }
    }, host)
}

export { HotkeysDevtoolsPanelNoOp }
