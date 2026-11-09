<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkey } from '../src/createHotkey.svelte'
  import type { RegisterableHotkey } from '@tanstack/hotkeys'

  interface HotkeyProps {
    hotkey: RegisterableHotkey
    enabled?: boolean
    meta?: { name: string }
  }

  let {
    initial,
    ready,
  }: {
    initial: HotkeyProps
    ready: (update: (next: Partial<HotkeyProps>) => void) => void
  } = $props()
  let current = $state((() => initial)())
  createHotkey(
    () => current.hotkey,
    () => {},
    () => ({ enabled: current.enabled ?? true, meta: current.meta }),
  )
  onMount(() =>
    ready((next) => {
      current = { ...current, ...next }
    }),
  )
</script>
