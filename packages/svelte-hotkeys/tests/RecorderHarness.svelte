<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import { createHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import type { SvelteHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'

  const { ready } = $props<{
    ready: (
      single: SvelteHotkeyRecorder,
      sequence: SvelteHotkeySequenceRecorder,
    ) => void
  }>()
  const single = createHotkeyRecorder({ onRecord: () => {} })
  const sequence = createHotkeySequenceRecorder({ onRecord: () => {} })
  onMount(() => ready(single, sequence))
</script>
