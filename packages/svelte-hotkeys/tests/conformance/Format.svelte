<script lang="ts">
  import { getFormatForAria } from '../../src/getFormatForAria'
  import { getFormatForDisplay } from '../../src/getFormatForDisplay'
  import type { formatForAria, formatForDisplay } from '@tanstack/hotkeys'

  let {
    ready,
  }: {
    ready: (
      format: typeof formatForDisplay,
      formatAria: typeof formatForAria,
    ) => void
  } = $props()
  ready(getFormatForDisplay(), getFormatForAria())
</script>
