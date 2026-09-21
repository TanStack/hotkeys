---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys includes three hooks for tracking the real-time state of keyboard keys. Use them to show modifier state in the UI or to build hold-to-activate features.

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

## Common patterns

### Hold-to-reveal UI

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

### Keyboard shortcut hints

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

### Debugging key display

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

## Platform quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

### macOS modifier key behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this automatically so held key state stays accurate.

### Window blur

When the browser window loses focus, the tracker clears all held keys. This prevents "stuck" keys that would otherwise appear held even after the user tabs away and releases them.

## Under the hood

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

## Modifier-held shortcut hints

`useHotkeyHint` answers whether held modifiers are relevant to a binding. Keep formatting and badge styling in your component:

```ts
const visible = useHotkeyHint('Alt+Shift+[KeyK]')
```

For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both reveals the hint. An extra Control hides it; releasing all modifiers or blurring the window hides it. Nonmodifier keys are ignored. AltGraph does not reveal hints. Pass `{ exact: true }` to require all binding modifiers, or `{ platform: 'mac' }` to resolve Mod explicitly. Supply the same platform used by the registration when overriding detection.

Combine the boolean with the action's enabled state. The helper does not register a shortcut or determine whether its target is focused. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.
