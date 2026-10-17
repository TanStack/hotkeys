<script lang="ts">
  import HotkeysProvider from '../src/HotkeysProvider.svelte'
  import Hk from './ScopesHotkey.svelte'
  import AppHk from './ScopesAppHotkeys.svelte'
  import type { AppHotkeys } from '@tanstack/hotkeys'
  import type { SvelteAppHotkeyList } from '../src/getAppHotkeys.svelte'
  import type { ScopesControls } from './scopes-controls.svelte'

  let {
    appHotkeys,
    controls,
    ready,
  }: {
    appHotkeys: AppHotkeys
    controls: ScopesControls
    ready: (list: SvelteAppHotkeyList) => void
  } = $props()
</script>

<HotkeysProvider
  {appHotkeys}
  customHotkeys={{ 'doc.save': 'Mod+E' }}
  defaultOptions={{ hotkey: { platform: 'mac' } }}
>
  <Hk hotkey="Mod+P" name="root" {controls} />
  <Hk hotkey="Mod+K" name="palette" {controls} />
  <HotkeysProvider scope="page" enabled={controls.enabled}>
    <Hk hotkey="Mod+S" name="page" {controls} />
    <HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}>
      <Hk hotkey="Mod+U" name="unscoped" {controls} />
    </HotkeysProvider>
    <HotkeysProvider scope="panel">
      <Hk hotkey="Mod+S" name="panel" {controls} />
      <AppHk {appHotkeys} {controls} {ready} />
    </HotkeysProvider>
  </HotkeysProvider>
  {#if controls.open}
    <HotkeysProvider
      scope="dialog"
      exclusive={controls.allow ? { allow: controls.allow } : true}
    >
      <Hk hotkey="Mod+S" name="dialog" {controls} />
    </HotkeysProvider>
  {/if}
</HotkeysProvider>
