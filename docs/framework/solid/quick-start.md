---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your first hotkey

The `createHotkey` primitive is the primary way to register keyboard shortcuts in Solid:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  createHotkey('Mod+S', () => {
    saveDocument()
  })

  return <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic. The registration is removed when the owning component is disposed.

## Common patterns

### Multiple hotkeys

Call `createHotkey` once per hotkey, or pass a list to `createHotkeys`:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: 'Escape', callback: () => closeDialog() },
  ])

  return <div>Editor with keyboard shortcuts</div>
}
```

### Scoped and conditional hotkeys

Pass an accessor for options that change. A `null` target waits until the element is attached:

```tsx
import { createSignal } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

function Panel(props: { open: boolean; onClose: () => void }) {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  createHotkey('Escape', () => props.onClose(), () => ({
    target: panel(),
    enabled: props.open,
  }))

  return (
    <div ref={setPanel} tabIndex={0}>
      Press Escape while focused here to close
    </div>
  )
}
```

### Multi-key sequences

Pass an array of chords to register a Vim-style sequence:

```tsx
createHotkey(['G', 'G'], () => scrollToTop())
createHotkey(['G', 'Shift+G'], () => scrollToBottom())
```

### Tracking held keys

```tsx
import { createHeldKeys, createKeyHold } from '@tanstack/solid-hotkeys'

function StatusBar() {
  const isShiftHeld = createKeyHold('Shift')
  const heldKeys = createHeldKeys()

  return (
    <div class="status-bar">
      {isShiftHeld() && <span>Shift mode active</span>}
      {heldKeys().length > 0 && <span>Keys: {heldKeys().join('+')}</span>}
    </div>
  )
}
```

### Displaying hotkeys in the UI

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'

function SaveButton() {
  return (
    <button>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
      {/* Mac: "⌘ S"  |  Windows: "Ctrl+S" */}
    </button>
  )
}
```

## Declaring app hotkeys

To list every hotkey in a cheat sheet, including hotkeys whose components haven't mounted, and to let users customize them, declare them once with `defineAppHotkeys` and pass them to `HotkeysProvider`. See the [App Hotkeys Guide](./guides/app-hotkeys).

## Default options provider

`HotkeysProvider` also sets default options for every hotkey primitive. Options passed directly to a primitive override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: true, timeout: 1500 },
        hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
      }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

## Setting up devtools

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'

function App() {
  return (
    <div>
      {/* Your app */}
      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}
```

## Next steps

- [Hotkeys Guide](./guides/hotkeys) - Deep dive into `createHotkey` options and patterns
- [Sequences Guide](./guides/sequences) - Multi-key sequence handling
- [App Hotkeys Guide](./guides/app-hotkeys) - Declaring, listing, and customizing every hotkey
- [Hotkey Recording Guide](./guides/hotkey-recording) - Recording chords and sequences in settings UIs
- [Key State Tracking Guide](./guides/key-state-tracking) - Real-time key state monitoring
- [Formatting & Display Guide](./guides/formatting-display) - Platform-aware hotkey formatting
