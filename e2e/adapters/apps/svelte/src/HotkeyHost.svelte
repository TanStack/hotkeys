<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { logCall } from '../../../shared/fixture'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { hotkey, enabled }: { hotkey: string; enabled: boolean } = $props()

  createHotkey(
    () => hotkey as Hotkey,
    () => logCall('hotkey'),
    () => ({ enabled }),
  )
</script>

<div id="hotkey-host"></div>
