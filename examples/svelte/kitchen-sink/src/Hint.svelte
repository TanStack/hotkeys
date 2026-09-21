<script lang="ts">
  import { formatForDisplay, getHotkeyHint } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'
  let { hotkey, enabled = true }: { hotkey: Hotkey; enabled?: boolean } =
    $props()
  const hint = getHotkeyHint(() => hotkey)
</script>

{#if hint.visible && enabled}<kbd>{formatForDisplay(hotkey)}</kbd>{/if}
