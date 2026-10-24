<script lang="ts">
  import { formatForDisplay, getHotkeyHint } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'
  let { hotkey }: { hotkey: Hotkey } = $props()
  const hint = getHotkeyHint(() => hotkey)
</script>

{#if hint.visible}<kbd>{formatForDisplay(hotkey)}</kbd>{/if}
