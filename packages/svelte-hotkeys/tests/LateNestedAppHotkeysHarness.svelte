<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import AppHotkeysChild from './AppHotkeysChild.svelte'
  import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
  import type { ChildApi } from './AppHotkeysChild.svelte'

  let {
    appHotkeys,
    customHotkeys,
    ready,
    setNested,
  }: {
    appHotkeys: AppHotkeys
    customHotkeys?: CustomHotkeys
    ready: (api: ChildApi) => void
    setNested: (set: (next: AppHotkeys) => void) => void
  } = $props()

  // The nested provider's declarations load after it renders.
  let nested = $state<AppHotkeys>()
  setNested((next) => (nested = next))
</script>

<HotkeysProvider
  {appHotkeys}
  {customHotkeys}
  defaultOptions={{ hotkey: { platform: 'mac' } }}
>
  <AppHotkeysChild {appHotkeys} {ready} />
  <HotkeysProvider appHotkeys={nested}>
    <span></span>
  </HotkeysProvider>
</HotkeysProvider>
