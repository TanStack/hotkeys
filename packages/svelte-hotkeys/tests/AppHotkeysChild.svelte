<script lang="ts" module>
  import type {
    SvelteAppHotkeyList,
    SvelteAppHotkeys,
    SvelteCustomHotkeys,
  } from '../src/getAppHotkeys.svelte'
  import type { SvelteHotkeyHint } from '../src/getHotkeyHint.svelte'

  export interface ChildApi {
    hotkeys: SvelteAppHotkeys
    list: SvelteAppHotkeyList
    custom: SvelteCustomHotkeys
    hint: SvelteHotkeyHint
    save: () => number
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkey } from '../src/createHotkey.svelte'
  import { createHotkeys } from '../src/createHotkeys.svelte'
  import {
    getAppHotkeyList,
    getAppHotkeys,
    getCustomHotkeys,
  } from '../src/getAppHotkeys.svelte'
  import { getHotkeyHint } from '../src/getHotkeyHint.svelte'
  import type { AppHotkeys } from '@tanstack/hotkeys'

  let {
    appHotkeys,
    ready,
  }: { appHotkeys: AppHotkeys; ready: (api: ChildApi) => void } = $props()

  let saves = 0
  createHotkey(appHotkeys['doc.save']!, () => saves++)
  createHotkeys([
    { hotkey: appHotkeys['palette.open']!, callback: () => {} },
    { hotkey: appHotkeys['nav.home']!, callback: () => {} },
  ])
  const api: ChildApi = {
    hotkeys: getAppHotkeys(),
    list: getAppHotkeyList(),
    custom: getCustomHotkeys(),
    hint: getHotkeyHint(appHotkeys['doc.save']!, { platform: 'mac' }),
    save: () => saves,
  }
  onMount(() => ready(api))
</script>
