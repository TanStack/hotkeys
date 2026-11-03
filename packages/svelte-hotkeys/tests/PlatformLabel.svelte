<script lang="ts">
  import { getFormatForDisplay } from '../src/getFormatForDisplay'

  let { platform }: { platform?: 'mac' | 'windows' | 'linux' } = $props()
  const format = getFormatForDisplay()
</script>

<kbd>{format('Mod+S', { platform })}</kbd>
