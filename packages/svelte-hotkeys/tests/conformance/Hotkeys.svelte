<script lang="ts">
  import { entryKeys } from '@tanstack/hotkeys-test-utils/conformance'
  import HotkeyList from './HotkeyList.svelte'
  import HotkeyOne from './HotkeyOne.svelte'
  import Provider from './Provider.svelte'
  import type { HotkeysSpec } from '@tanstack/hotkeys-test-utils/conformance'

  let {
    spec,
    onElement,
  }: { spec: HotkeysSpec; onElement: (element: HTMLElement) => void } = $props()
  // One component per callback, so changing an entry updates it in place.
  const keys = $derived(entryKeys(spec.hotkeys))
</script>

<Provider provider={spec.provider}>
  {#if spec.form === 'list'}
    <HotkeyList hotkeys={spec.hotkeys} {onElement} />
  {:else}
    {#each keys as key (key)}
      <HotkeyOne entry={spec.hotkeys[keys.indexOf(key)]!} {onElement} />
    {/each}
  {/if}
</Provider>
