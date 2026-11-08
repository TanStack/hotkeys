<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import App from './App.svelte'
  import { setActivity } from './activity.svelte'

  setActivity()
</script>

<HotkeysProvider><App /></HotkeysProvider>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
