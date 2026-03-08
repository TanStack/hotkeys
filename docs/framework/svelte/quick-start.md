---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

The `createHotkey` function is the primary way to register keyboard shortcuts in Svelte:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    saveDocument()
  })
</script>

<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => save())
  createHotkey('Mod+Z', () => undo())
  createHotkey('Mod+Shift+Z', () => redo())
  createHotkey('Mod+F', () => openSearch())
  createHotkey('Escape', () => closeDialog())
</script>
```

### Scoped Hotkeys with Refs

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let panelRef = $state<HTMLDivElement | null>(null)

  createHotkey('Escape', () => closePanel(), { target: () => panelRef })
</script>

<div bind:this={panelRef} tabindex="0">
  <p>Press Escape while focused here to close</p>
</div>
```

### Conditional Hotkeys

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isOpen = $state(true)

  createHotkey('Escape', () => {
    isOpen = false
  }, { enabled: () => isOpen })
</script>
```

### Multi-Key Sequences

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  createHotkeySequence(['G', 'G'], () => scrollToTop())
  createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
</script>
```

### Tracking Held Keys

```svelte
<script lang="ts">
  import { getHeldKeys, getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<div class="status-bar">
  {#if isShiftHeld}<span>Shift mode active</span>{/if}
  {#if $heldKeys.length > 0}<span>Keys: {$heldKeys.join('+')}</span>{/if}
</div>
```

### Displaying Hotkeys in the UI

```svelte
<script lang="ts">
  import { formatForDisplay, createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => save())
</script>

<button>
  Save <kbd>{formatForDisplay('Mod+S')}</kbd>
</button>
```

## Default Options Provider

Wrap part of your app with `HotkeysProvider` to set default options for all Svelte hotkey functions in that subtree:

```svelte
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
</script>

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: true },
    hotkeySequence: { timeout: 1500 },
    hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
  }}
>
  <AppContent />
</HotkeysProvider>
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys)
- [Sequences Guide](./guides/sequences)
- [Hotkey Recording Guide](./guides/hotkey-recording)
- [Key State Tracking Guide](./guides/key-state-tracking)
- [Formatting & Display Guide](./guides/formatting-display)
