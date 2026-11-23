<script lang="ts">
  import { getFormatForDisplay } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { hotkey }: { hotkey: Hotkey } = $props()
  const formatForDisplay = getFormatForDisplay()
</script>

<kbd>{formatForDisplay(hotkey)}</kbd>
