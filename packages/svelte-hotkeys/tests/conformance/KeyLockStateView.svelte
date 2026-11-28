<script lang="ts">
  import { onMount } from 'svelte'
  import { getKeyLockState } from '../../src/getKeyLockState.svelte'
  import type { LockKey } from '@tanstack/hotkeys'

  let {
    watch,
    ready,
  }: {
    watch: LockKey
    ready: (setKey: (key: LockKey) => void) => void
  } = $props()
  let key = $state((() => watch)())
  const lock = $derived(getKeyLockState(key))
  onMount(() =>
    ready((next) => {
      key = next
    }),
  )
</script>

<output data-testid="lock">{JSON.stringify(lock.value)}</output>
