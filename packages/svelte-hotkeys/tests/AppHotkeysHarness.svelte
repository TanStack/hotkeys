<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import AppHotkeysChild from './AppHotkeysChild.svelte'
  import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
  import type { ChildApi } from './AppHotkeysChild.svelte'

  let {
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    ready,
  }: {
    appHotkeys: AppHotkeys
    customHotkeys?: CustomHotkeys
    onCustomHotkeysChange?: (custom: CustomHotkeys) => void
    ready: (api: ChildApi) => void
  } = $props()
</script>

<HotkeysProvider
  {appHotkeys}
  {customHotkeys}
  {onCustomHotkeysChange}
  defaultOptions={{ hotkey: { platform: 'mac' } }}
>
  <AppHotkeysChild {appHotkeys} {ready} />
</HotkeysProvider>
