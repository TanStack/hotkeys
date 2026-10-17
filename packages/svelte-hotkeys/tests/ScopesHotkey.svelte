<script lang="ts">
  import { createHotkey } from '../src/createHotkey.svelte'
  import type { Hotkey } from '@tanstack/hotkeys'
  import type { ScopesControls } from './scopes-controls.svelte'

  let {
    hotkey,
    name,
    controls,
  }: { hotkey: Hotkey; name: string; controls: ScopesControls } = $props()

  createHotkey(
    () => hotkey,
    () => (controls.fired[name] = (controls.fired[name] ?? 0) + 1),
    () => ({ meta: { name } }),
  )
</script>
