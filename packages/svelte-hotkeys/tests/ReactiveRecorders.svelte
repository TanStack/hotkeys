<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import { createHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import type { SvelteHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'

  let {
    first,
    second,
    ready,
  }: {
    first: () => void
    second: () => void
    ready: (
      single: SvelteHotkeyRecorder,
      sequence: SvelteHotkeySequenceRecorder,
      change: () => void,
    ) => void
  } = $props()
  let changed = $state(false)
  const options = {
    onRecord() {},
    get onCancel() {
      return changed ? second : first
    },
  }
  const single = createHotkeyRecorder(options)
  const sequence = createHotkeySequenceRecorder(options)
  onMount(() =>
    ready(single, sequence, () => {
      changed = true
    }),
  )
</script>
