<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import KeyboardLayoutLabel from './KeyboardLayoutLabel.svelte'
  import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

  let {
    keyboardLayout: initial,
    nested = false,
    count = 1,
    layoutMap,
    ready,
  }: {
    keyboardLayout?: boolean
    /** Wraps the label in a provider that turns the layout back on. */
    nested?: boolean
    count?: number
    layoutMap?: KeyboardLayoutMap
    ready?: (setKeyboardLayout: (value: boolean) => void) => void
  } = $props()
  // svelte-ignore state_referenced_locally
  let keyboardLayout = $state(initial)
  // svelte-ignore state_referenced_locally
  ready?.((value) => (keyboardLayout = value))
</script>

<HotkeysProvider defaultOptions={{ platform: 'windows', keyboardLayout }}
  >{#if nested}<HotkeysProvider defaultOptions={{ keyboardLayout: true }}
      ><KeyboardLayoutLabel /></HotkeysProvider
    >{:else}{#each { length: count } as _}<KeyboardLayoutLabel
        {layoutMap}
      />{/each}{/if}</HotkeysProvider
>
