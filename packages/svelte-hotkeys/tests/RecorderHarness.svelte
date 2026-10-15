<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

  const { ready } = $props<{
    ready: (
      single: SvelteHotkeyRecorder,
      sequence: SvelteHotkeyRecorder,
    ) => void
  }>()
  const single = createHotkeyRecorder({ onRecord: () => {} })
  const sequence = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: () => {},
  })
  onMount(() => ready(single, sequence))
</script>
