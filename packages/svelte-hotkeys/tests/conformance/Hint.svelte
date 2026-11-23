<script lang="ts">
  import { getHotkeyHint } from '../../src/getHotkeyHint.svelte'
  import type {
    HeldModifierOptions,
    RegisterableHotkey,
  } from '@tanstack/hotkeys'

  let {
    hotkey,
    options,
  }: {
    hotkey: RegisterableHotkey | null | undefined
    options?: HeldModifierOptions
  } = $props()
  const hint = getHotkeyHint(
    () => hotkey,
    () => options ?? {},
  )
</script>

<output data-testid="hint">{String(hint.visible)}</output>
