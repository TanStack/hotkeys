<script lang="ts">
  import { onMount } from 'svelte'
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import PlatformChild from './PlatformChild.svelte'
  import type { Hotkey } from '@tanstack/hotkeys'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

  type Platform = 'mac' | 'windows' | 'linux'
  let {
    initial,
    hotkeyPlatform,
    labelPlatform,
    onHotkey,
    onRecord,
    ready,
  }: {
    initial: Platform
    hotkeyPlatform?: Platform
    labelPlatform?: Platform
    onHotkey: () => void
    onRecord: (hotkey: Hotkey) => void
    ready: (
      recorder: SvelteHotkeyRecorder,
      setPlatform: (platform: Platform) => void,
    ) => void
  } = $props()
  // svelte-ignore state_referenced_locally
  let platform = $state(initial)
  let recorder = $state<SvelteHotkeyRecorder>()
  onMount(() => ready(recorder!, (next) => (platform = next)))
</script>

<HotkeysProvider defaultOptions={{ platform }}
  ><PlatformChild
    {hotkeyPlatform}
    {labelPlatform}
    {onHotkey}
    {onRecord}
    bind:recorder
  /></HotkeysProvider
>
