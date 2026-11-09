<script lang="ts">
  import { onMount } from 'svelte'
  import { getHeldKeyCodesMap } from '../src/getHeldKeyCodesMap.svelte'
  import { getHeldKeys } from '../src/getHeldKeys.svelte'
  import { getIsKeyHeld } from '../src/getIsKeyHeld.svelte'
  import type { IndividualKey } from '@tanstack/hotkeys'

  let {
    watch,
    ready,
  }: {
    watch: IndividualKey
    ready: (setKey: (key: IndividualKey) => void) => void
  } = $props()
  let key = $state((() => watch)())
  const heldKeys = getHeldKeys()
  const heldCodes = getHeldKeyCodesMap()
  const hold = $derived(getIsKeyHeld(key))
  onMount(() =>
    ready((next) => {
      key = next
    }),
  )
</script>

<output data-testid="keys">{JSON.stringify(heldKeys.keys)}</output>
<output data-testid="codes">{JSON.stringify(heldCodes.codes)}</output>
<output data-testid="held">{String(hold.held)}</output>
