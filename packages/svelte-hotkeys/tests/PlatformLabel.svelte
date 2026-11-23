<script lang="ts">
  import { getFormatForDisplay } from '../src/getFormatForDisplay'
  import type { HotkeyPlatform } from '@tanstack/hotkeys'

  let { platform }: { platform?: HotkeyPlatform } = $props()
  const formatForDisplay = getFormatForDisplay()
</script>

<kbd>{formatForDisplay('Mod+S', { platform })}</kbd>
