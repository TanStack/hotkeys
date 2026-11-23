<script lang="ts">
  import { getFormatForDisplay, getHotkeyHint } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { hotkey }: { hotkey: Hotkey } = $props()
  const formatForDisplay = getFormatForDisplay()
  const hint = getHotkeyHint(() => hotkey)
</script>

{#if hint.visible}<kbd>{formatForDisplay(hotkey)}</kbd>{/if}
