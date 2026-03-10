---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

Use `createHotkey` for global shortcuts and attachments for element-scoped shortcuts.

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

### Multiple global hotkeys

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

### Scoped hotkeys with attachments

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  const closePanel = createHotkeyAttachment('Escape', () => {
    close()
  })
</script>

<div tabindex="0" {@attach closePanel}>
  <p>Press Escape while focused here to close</p>
</div>
```

### Reactive options

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isOpen = $state(true)

  createHotkey(
    'Escape',
    () => {
      isOpen = false
    },
    () => ({ enabled: isOpen }),
  )
</script>
```

### Scoped sequences

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const vimKeys = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach vimKeys}>
  Focus here, then press g then g
</div>
```

### Tracking held keys

```svelte
<script lang="ts">
  import { getHeldKeys, getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<div class="status-bar">
  {#if isShiftHeld.held}<span>Shift mode active</span>{/if}
  {#if heldKeys.keys.length > 0}
    <span>Keys: {heldKeys.keys.join('+')}</span>
  {/if}
</div>
```

### Recording shortcuts

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
</script>

<button onclick={recorder.startRecording}>
  {recorder.recordedHotkey
    ? formatForDisplay(recorder.recordedHotkey)
    : 'Click to record'}
</button>
```

### Displaying hotkeys in the UI

```svelte
<script lang="ts">
  import { formatForDisplay, createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => save())
</script>

<button>
  Save <kbd>{formatForDisplay('Mod+S')}</kbd>
</button>
```

## Default options

Use `setHotkeysContext` when you want defaults for a subtree. This is an advanced API and usually belongs near the root of the part of the app that owns the hotkeys.

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkey: { preventDefault: true },
    hotkeySequence: { timeout: 1500 },
  })
</script>
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys)
- [Sequences Guide](./guides/sequences)
- [Hotkey Recording Guide](./guides/hotkey-recording)
- [Key State Tracking Guide](./guides/key-state-tracking)
- [Formatting & Display Guide](./guides/formatting-display)
