<script lang="ts">
  import { onMount } from 'svelte'
  import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
  import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

  let {
    first,
    second,
    ready,
  }: {
    first: () => void
    second: () => void
    ready: (
      single: SvelteHotkeyRecorder,
      sequence: SvelteHotkeyRecorder,
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
  const sequenceOptions = {
    maxSteps: Infinity,
    onRecord() {},
    get onCancel() {
      return changed ? second : first
    },
  }
  const single = createHotkeyRecorder(options)
  const sequence = createHotkeyRecorder(sequenceOptions)
  onMount(() =>
    ready(single, sequence, () => {
      changed = true
    }),
  )
</script>
