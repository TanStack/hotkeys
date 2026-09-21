<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import App from './App.svelte'
</script>

<HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}
  ><App /></HotkeysProvider
>
