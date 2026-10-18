<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkey } from '../src/createHotkey.svelte'
  import { getAppHotkeyList } from '../src/getAppHotkeys.svelte'
  import type { AppHotkeys } from '@tanstack/hotkeys'
  import type { SvelteAppHotkeyList } from '../src/getAppHotkeys.svelte'
  import type { ScopesControls } from './scopes-controls.svelte'

  let {
    appHotkeys,
    controls,
    ready,
  }: {
    appHotkeys: AppHotkeys
    controls: ScopesControls
    ready: (list: SvelteAppHotkeyList) => void
  } = $props()

  createHotkey(
    appHotkeys['doc.save']!,
    () => (controls.fired.app = (controls.fired.app ?? 0) + 1),
  )
  const list = getAppHotkeyList()
  onMount(() => ready(list))
</script>
