import type { HotkeysDevtoolsSvelteInit } from '../src/SvelteHotkeysDevtools'

export function createPanelProps() {
  const props = $state<HotkeysDevtoolsSvelteInit>({})
  return props
}
