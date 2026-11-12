<script lang="ts">
  import { getFormatForDisplay } from '../src/getFormatForDisplay'

  let { platform }: { platform?: 'mac' | 'windows' | 'linux' } = $props()
  const formatForDisplay = getFormatForDisplay()
</script>

<kbd>{formatForDisplay('Mod+S', { platform })}</kbd>
