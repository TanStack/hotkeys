import { getHotkeyHint } from '../src/getHotkeyHint.svelte'
import type { Hotkey } from '@tanstack/hotkeys'

export function harness(onValue: (value: boolean) => void) {
  let binding = $state<Hotkey>('Alt+[KeyS]')
  const hint = getHotkeyHint(() => binding)
  const destroy = $effect.root(() => {
    $effect(() => onValue(hint.visible))
  })
  return {
    setBinding: (value: Hotkey) => {
      binding = value
    },
    destroy,
  }
}
