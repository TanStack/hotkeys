<script lang="ts">
  import { createHotkeyRecorder } from '../../src/createHotkeyRecorder.svelte'
  import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
  import type { SvelteHotkeyRecorder } from '../../src/createHotkeyRecorder.svelte'

  let {
    options,
    ready,
  }: {
    options: HotkeyRecorderOptions
    ready: (recorder: SvelteHotkeyRecorder) => void
  } = $props()
  ready(createHotkeyRecorder(options as never))
</script>
