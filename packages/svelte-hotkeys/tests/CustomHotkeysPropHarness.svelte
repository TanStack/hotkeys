<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import AppHotkeysChild from './AppHotkeysChild.svelte'
  import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
  import type { ChildApi } from './AppHotkeysChild.svelte'

  let {
    appHotkeys,
    onCustomHotkeysChange,
    ready,
    setSaved,
  }: {
    appHotkeys: AppHotkeys
    onCustomHotkeysChange?: (custom: CustomHotkeys) => void
    ready: (api: ChildApi) => void
    setSaved: (set: (next: CustomHotkeys | null) => void) => void
  } = $props()

  let saved = $state<CustomHotkeys | null>(null)
  setSaved((next) => (saved = next))
</script>

<HotkeysProvider
  {appHotkeys}
  customHotkeys={saved}
  {onCustomHotkeysChange}
  defaultOptions={{ hotkey: { platform: 'mac' } }}
>
  <!-- A nested provider without appHotkeys shares the store. -->
  <HotkeysProvider scope="nested">
    <AppHotkeysChild {appHotkeys} {ready} />
  </HotkeysProvider>
</HotkeysProvider>
