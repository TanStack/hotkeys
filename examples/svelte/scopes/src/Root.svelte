<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import { setActivity } from './activity.svelte'
  import App from './App.svelte'

  setActivity()
</script>

<HotkeysProvider><App /></HotkeysProvider>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
