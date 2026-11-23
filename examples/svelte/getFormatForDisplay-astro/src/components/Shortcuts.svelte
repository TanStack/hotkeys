<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import CheatSheetPage from '../CheatSheetPage.svelte'
  import type { HotkeyPlatform } from '@tanstack/svelte-hotkeys'

  let { platform }: { platform: HotkeyPlatform } = $props()
</script>

<!-- Each island is its own Svelte app, so the provider renders inside it -->
<HotkeysProvider defaultOptions={{ platform }}>
  <CheatSheetPage />
</HotkeysProvider>
