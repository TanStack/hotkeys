<script lang="ts">
  import { formatForDisplay } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { hotkey }: { hotkey: Hotkey } = $props()
</script>

<kbd>{formatForDisplay(hotkey)}</kbd>
