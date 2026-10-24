import { getHotkeyScopesState } from '../src/getHotkeyScopesState.svelte'
import type { HotkeyScopesState } from '@tanstack/hotkeys'

export interface ScopesControls {
  open: boolean
  enabled: boolean
  allow: Array<string> | null
  fired: Record<string, number>
}

export function createScopesControls(): ScopesControls {
  const controls: ScopesControls = $state({
    open: false,
    enabled: true,
    allow: null,
    fired: {},
  })
  return controls
}

/** Calls `onValue` with the scopes state now and each time it changes. */
export function watchScopesState(
  onValue: (state: HotkeyScopesState) => void,
): () => void {
  const scopes = getHotkeyScopesState()
  return $effect.root(() => {
    $effect(() => onValue(scopes.state))
  })
}
