<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import App from './App.svelte'
</script>

<HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}
  ><App /></HotkeysProvider
>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
