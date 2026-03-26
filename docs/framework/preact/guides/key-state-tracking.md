---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three hooks for tracking the real-time state of keyboard keys. These are useful for building UIs that respond to modifier keys being held, displaying active key states, or implementing hold-to-activate features.

## `useHeldKeys`

Returns a reactive array of all currently held key names.

```tsx
import { useHeldKeys } from '@tanstack/preact-hotkeys'

function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      {heldKeys.length > 0
        ? `Held: ${heldKeys.join(' + ')}`
        : 'No keys held'}
    </div>
  )
}
```

The returned array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

## `useHeldKeyCodes`

Returns a reactive object mapping held key names to their physical key codes (`event.code` values). This is useful when you need to distinguish between left and right modifiers.

```tsx
import { useHeldKeyCodes } from '@tanstack/preact-hotkeys'

function KeyCodeDisplay() {
  const heldCodes = useHeldKeyCodes()
  // Example: { Shift: "ShiftLeft", Control: "ControlRight" }

  return (
    <div>
      {Object.entries(heldCodes).map(([key, code]) => (
        <div key={key}>
          {key}: {code}
        </div>
      ))}
    </div>
  )
}
```

## `useKeyHold`

Checks whether a specific key is currently held. This hook is optimized to only trigger re-renders when the specified key's held state changes, not when other keys are pressed or released.

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function ModifierIndicators() {
  const isShiftHeld = useKeyHold('Shift')
  const isCtrlHeld = useKeyHold('Control')
  const isAltHeld = useKeyHold('Alt')
  const isMetaHeld = useKeyHold('Meta')

  return (
    <div className="modifier-bar">
      <span className={isShiftHeld ? 'active' : ''}>Shift</span>
      <span className={isCtrlHeld ? 'active' : ''}>Ctrl</span>
      <span className={isAltHeld ? 'active' : ''}>Alt</span>
      <span className={isMetaHeld ? 'active' : ''}>Meta</span>
    </div>
  )
}
```

## Common Patterns

### Hold-to-Reveal UI

Show additional options while a modifier is held:

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function FileItem({ file }: { file: File }) {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div className="file-item">
      <span>{file.name}</span>
      {isShiftHeld && (
        <button className="danger" onClick={() => permanentlyDelete(file)}>
          Permanently Delete
        </button>
      )}
      {!isShiftHeld && (
        <button onClick={() => moveToTrash(file)}>
          Move to Trash
        </button>
      )}
    </div>
  )
}
```

### Keyboard Shortcut Hints

Display different shortcut hints based on which modifiers are held:

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function ShortcutHints() {
  const isModHeld = useKeyHold('Meta') // or 'Control' on Windows

  if (!isModHeld) return null

  return (
    <div className="shortcut-overlay">
      <div>S - Save</div>
      <div>Z - Undo</div>
      <div>Shift+Z - Redo</div>
      <div>K - Command Palette</div>
    </div>
  )
}
```

### Debugging Key Display

Combine hooks with formatting utilities for a rich debugging display:

```tsx
import {
  useHeldKeys,
  useHeldKeyCodes,
  formatForDisplay,
  type RegisterableHotkey,
} from '@tanstack/preact-hotkeys'

function KeyDebugger() {
  const heldKeys = useHeldKeys()
  const heldCodes = useHeldKeyCodes()

  return (
    <div className="key-debugger">
      <h3>Active Keys</h3>
      {heldKeys.map((key) => (
        <div key={key}>
          <strong>
            {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}
          </strong>
          <span className="code">{heldCodes[key]}</span>
        </div>
      ))}
      {heldKeys.length === 0 && <p>Press any key...</p>}
    </div>
  )
}
```

## Platform Quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

### macOS Modifier Key Behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this automatically so held key state stays accurate.

### Window Blur

When the browser window loses focus, all held keys are automatically cleared. This prevents "stuck" keys that would otherwise appear held even after the user tabs away and releases them.

## Under the Hood

All three hooks subscribe to the singleton `KeyStateTracker` via `@tanstack/preact-store`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store, which the hooks subscribe to reactively.

```tsx
import { getKeyStateTracker } from '@tanstack/preact-hotkeys'

const tracker = getKeyStateTracker()

// Imperative access (outside of Preact)
tracker.getHeldKeys()        // string[]
tracker.isKeyHeld('Shift')   // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```
