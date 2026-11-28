<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import { setContext } from 'svelte'
  import App from './App.svelte'

  const CHARACTER_KEYS_KEY = 'tanstack-hotkeys-kitchen-sink-character-keys'

  // The user's "Single-key shortcuts" setting. While it is off, the root
  // provider suspends character key shortcuts, such as the G G sequence.
  const characterKeys = $state({
    enabled: localStorage.getItem(CHARACTER_KEYS_KEY) !== 'off',
  })
  setContext('characterKeys', characterKeys)
  $effect(() => {
    localStorage.setItem(
      CHARACTER_KEYS_KEY,
      characterKeys.enabled ? 'on' : 'off',
    )
  })
</script>

<!-- The setting applies app-wide while this provider is mounted. -->
<HotkeysProvider
  defaultOptions={{ hotkey: { requireReset: true } }}
  suspendCharacterKeys={!characterKeys.enabled}><App /></HotkeysProvider
>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
