import type { Component } from 'solid-js'

export interface HotkeysDevtoolsSolidInit {
  initialIsOpen?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

// TODO: Implement full devtools panel once @tanstack/devtools-utils supports SolidJS
export const HotkeysDevtoolsPanel: Component<HotkeysDevtoolsSolidInit> = () => {
  return null
}

export const HotkeysDevtoolsPanelNoOp: Component<HotkeysDevtoolsSolidInit> = () => {
  return null
}
