---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

The `useHotkey` hook is the primary way to register keyboard shortcuts in React:

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function App() {
  useHotkey('Mod+S', () => {
    saveDocument()
  })

  return <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

Register as many hotkeys as you need. Each `useHotkey` call is independent:

```tsx
function Editor() {
  useHotkey('Mod+S', () => save())
  useHotkey('Mod+Z', () => undo())
  useHotkey('Mod+Shift+Z', () => redo())
  useHotkey('Mod+F', () => openSearch())
  useHotkey('Escape', () => closeDialog())

  return <div>Editor with keyboard shortcuts</div>
}
```

### Scoped Hotkeys with Refs

Attach hotkeys to specific elements instead of the entire document:

```tsx
import { useRef } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // This hotkey only fires when the panel (or its children) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      <p>Press Escape while focused here to close</p>
    </div>
  )
}
```

### Conditional Hotkeys

Enable or disable hotkeys based on application state:

```tsx
function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useHotkey('Escape', () => onClose(), { enabled: isOpen })

  if (!isOpen) return null

  return (
    <div className="modal">
      <p>Press Escape to close</p>
    </div>
  )
}
```

### Multi-Key Sequences

Register Vim-style key sequences with `useHotkeySequence`:

```tsx
import { useHotkeySequence } from '@tanstack/react-hotkeys'

function VimStyleApp() {
  useHotkeySequence(['G', 'G'], () => scrollToTop())
  useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())

  return <div>Use gg to go to top, gG to go to bottom</div>
}
```

### Tracking Held Keys

Display modifier key state for power-user UIs:

```tsx
import { useKeyHold, useHeldKeys } from '@tanstack/react-hotkeys'

function StatusBar() {
  const isShiftHeld = useKeyHold('Shift')
  const heldKeys = useHeldKeys()

  return (
    <div className="status-bar">
      {isShiftHeld && <span>Shift mode active</span>}
      {heldKeys.length > 0 && <span>Keys: {heldKeys.join('+')}</span>}
    </div>
  )
}
```

### Displaying Hotkeys in the UI

Format hotkeys for platform-aware display:

```tsx
import { useHotkey, formatForDisplay } from '@tanstack/react-hotkeys'

function SaveButton() {
  useHotkey('Mod+S', () => save())

  return (
    <button>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
      {/* Mac: "⌘S"  |  Windows: "Ctrl+S" */}
    </button>
  )
}
```

## Setting Up Devtools

Add the TanStack Devtools to your app to inspect registered hotkeys, view held keys, and test shortcuts:

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

function App() {
  return (
    <div>
      {/* Your app */}
      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}
```

## Default Options Provider

Wrap your app with `HotkeysProvider` to set default options for all hotkey hooks globally. Any options passed directly to a hook will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: true },
        hotkeySequence: { timeout: 1500 },
        hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
      }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys) - Deep dive into `useHotkey` options and patterns
- [Sequences Guide](./guides/sequences) - Multi-key sequence handling
- [Hotkey Recording Guide](./guides/hotkey-recording) - Building shortcut customization UIs
- [Sequence Recording Guide](./guides/sequence-recording)
- [Key State Tracking Guide](./guides/key-state-tracking) - Real-time key state monitoring
- [Formatting & Display Guide](./guides/formatting-display) - Platform-aware hotkey formatting
