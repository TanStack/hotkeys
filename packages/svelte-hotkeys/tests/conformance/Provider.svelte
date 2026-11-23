<script lang="ts">
  import HotkeysProvider from '../../src/HotkeysProvider.svelte'
  import type { ConformanceProvider } from '@tanstack/hotkeys-test-utils/conformance'
  import type { Snippet } from 'svelte'

  let {
    provider,
    children,
  }: { provider?: ConformanceProvider; children: Snippet } = $props()
</script>

{#if provider}
  <HotkeysProvider
    scope={provider.scope}
    enabled={provider.enabled}
    exclusive={provider.exclusive}
    appHotkeys={provider.appHotkeys}
    customHotkeys={provider.customHotkeys as never}
    defaultOptions={{ platform: provider.platform, hotkey: provider.hotkey }}
  >
    {@render children()}
  </HotkeysProvider>
{:else}
  {@render children()}
{/if}
