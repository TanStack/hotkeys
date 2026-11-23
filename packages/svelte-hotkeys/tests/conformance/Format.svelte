<script lang="ts">
  import { getFormatForDisplay } from '../../src/getFormatForDisplay'
  import type { formatForDisplay } from '@tanstack/hotkeys'

  let { ready }: { ready: (format: typeof formatForDisplay) => void } = $props()
  ready(getFormatForDisplay())
</script>
