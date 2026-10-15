<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import App from './App.svelte'
</script>

<App />

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
