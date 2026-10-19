# App hotkeys in Svelte

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Svelte wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/svelte-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/svelte-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import type { CustomHotkeys } from '@tanstack/svelte-hotkeys'
  import { appHotkeys } from './app-hotkeys'
  import AppContent from './AppContent.svelte'

  const saved: CustomHotkeys = JSON.parse(
    localStorage.getItem('hotkeys') ?? '{}',
  )
</script>

<HotkeysProvider
  {appHotkeys}
  customHotkeys={saved}
  onCustomHotkeysChange={(custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom))}
>
  <AppContent />
</HotkeysProvider>
```

Read app hotkeys inside a getter so registrations follow rebinding: `createHotkey(() => appHotkeys.current['doc.save'], save)`, with `const appHotkeys = getAppHotkeys()`. Build a cheat sheet from `getAppHotkeyList().current`.

A settings row records with `createHotkeyRecorder` and saves through `getCustomHotkeys`:

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    formatForDisplay,
    getAppHotkeys,
    getCustomHotkeys,
  } from '@tanstack/svelte-hotkeys'
  import type { AppHotkeyId } from '@tanstack/svelte-hotkeys'

  let { id }: { id: AppHotkeyId } = $props()
  const appHotkeys = getAppHotkeys()
  const custom = getCustomHotkeys()
  const appHotkey = $derived(appHotkeys.current[id])

  const recorder = createHotkeyRecorder(() => ({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = custom.findConflicts(id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => custom.setCustomHotkey(id, hotkey),
    onClear: () => custom.setCustomHotkey(id, null),
  }))
</script>

{appHotkey.meta?.name}: {appHotkey.hotkey
  ? formatForDisplay(appHotkey.hotkey)
  : 'Unassigned'}
<button onclick={recorder.startRecording}>Change</button>
<button onclick={() => custom.resetCustomHotkey(id)}>Reset</button>
```
