<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import AppHotkeysChild from './AppHotkeysChild.svelte'
  import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
  import type { ChildApi } from './AppHotkeysChild.svelte'

  let {
    appHotkeys,
    customHotkeys,
    onCustomHotkeysChange,
    platform: initialPlatform,
    setPlatform,
    ready,
  }: {
    appHotkeys: AppHotkeys
    customHotkeys?: CustomHotkeys
    onCustomHotkeysChange?: (custom: CustomHotkeys) => void
    platform?: 'mac' | 'windows'
    setPlatform?: (set: (next: 'mac' | 'windows') => void) => void
    ready: (api: ChildApi) => void
  } = $props()

  let platform = $state(initialPlatform)
  setPlatform?.((next) => (platform = next))
</script>

<HotkeysProvider
  {appHotkeys}
  {customHotkeys}
  {onCustomHotkeysChange}
  defaultOptions={{ hotkey: { platform: 'mac' }, platform }}
>
  <AppHotkeysChild {appHotkeys} {ready} />
</HotkeysProvider>
