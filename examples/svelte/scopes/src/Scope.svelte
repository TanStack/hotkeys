<script lang="ts">
  /** A `HotkeysProvider` with a box around its children, labeled with its props. */
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import ScopeFrame from './ScopeFrame.svelte'
  import type { Snippet } from 'svelte'
  import type { ExclusiveOption } from './activity.svelte'

  let {
    scope,
    exclusive,
    enabled,
    children,
  }: {
    scope: string
    exclusive?: ExclusiveOption
    enabled?: boolean
    children: Snippet
  } = $props()
</script>

<HotkeysProvider {scope} {exclusive} {enabled}>
  <ScopeFrame {scope} {exclusive} {enabled}>{@render children()}</ScopeFrame>
</HotkeysProvider>
