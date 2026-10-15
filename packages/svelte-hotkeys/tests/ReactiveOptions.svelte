<script lang="ts">
  import { onMount } from 'svelte'
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import Child from './ReactiveOptionsChild.svelte'
  import type { HotkeyCallback } from '@tanstack/hotkeys'

  let {
    callback,
    kind,
    ready,
  }: {
    callback: HotkeyCallback
    kind: 'local' | 'provider'
    ready: (disable: () => void) => void
  } = $props()
  let enabled = $state(true)
  onMount(() =>
    ready(() => {
      enabled = false
    }),
  )
</script>

<HotkeysProvider defaultOptions={{ hotkey: { enabled } }}
  ><Child {enabled} {callback} {kind} /></HotkeysProvider
>
