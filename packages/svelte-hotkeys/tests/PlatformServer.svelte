<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import PlatformLabel from './PlatformLabel.svelte'

  let { platform }: { platform: 'mac' | 'windows' } = $props()
</script>

<HotkeysProvider defaultOptions={{ platform }}
  ><PlatformLabel /></HotkeysProvider
>
