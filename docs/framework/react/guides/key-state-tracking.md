---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three hooks for tracking which keys are held down right now. Use them to show modifier state in the UI or to build hold-to-activate features.

## `useHeldKeys`

Returns a reactive array of all currently held key names.

```tsx
import { useHeldKeys } from '@tanstack/react-hotkeys'

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

Returns a reactive object mapping held key names to their physical key codes (`event.code` values). Reach for this when you need to tell left and right modifiers apart.

```tsx
import { useHeldKeyCodes } from '@tanstack/react-hotkeys'

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

Checks whether a specific key is currently held. The hook only re-renders when that key's held state changes, not when other keys are pressed or released.

```tsx
import { useKeyHold } from '@tanstack/react-hotkeys'

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

### Reading held keys inside a stable callback

`useKeyHold` and `useHeldKeys` return the state for the current render. If a memoized callback reads those values, include them in its dependencies so it sees updates.

For an event handler that should read the latest held keys without subscribing to render updates, use the existing `getKeyStateTracker()` API:

```tsx
import { useCallback } from 'react'
import { getKeyStateTracker } from '@tanstack/react-hotkeys'

function KeyInspector() {
  const tracker = getKeyStateTracker()
  const logHeldKeys = useCallback(() => {
    console.log(tracker.getHeldKeys())
    console.log('Space held:', tracker.isKeyHeld('Space'))
  }, [tracker])

  return <button type="button" onClick={logHeldKeys}>Log held keys</button>
}
```

The tracker is a shared singleton, so its identity stays stable during normal use. Initialize it while setting up the component, before the keys you want to observe are pressed. Read `getHeldKeys()` or `isKeyHeld()` inside the callback; saving their return values outside the callback would save an earlier snapshot. These imperative reads do not subscribe the component to updates. Use the hooks when held keys affect rendering, and do not destroy the shared tracker when a component unmounts.

For a mouse or wheel handler that only needs a modifier's state for that event, read the event's `ctrlKey`, `shiftKey`, `altKey`, or `metaKey` property directly:

```tsx
import { useCallback } from 'react'
import type { WheelEvent } from 'react'

function WheelInspector() {
  const onWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) {
      console.log('Wheel event with Control modifier')
    }
  }, [])

  return <div onWheel={onWheel}>Scroll here</div>
}
```

This reads the modifier state reported by the event. Browsers can also report `ctrlKey` for a trackpad pinch gesture, so it does not necessarily mean the physical Control key is held.

### Hold-to-reveal UI

Show additional options while a modifier is held:

```tsx
import { useKeyHold } from '@tanstack/react-hotkeys'

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
import { useKeyHold } from '@tanstack/react-hotkeys'

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
} from '@tanstack/react-hotkeys'

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

The underlying `KeyStateTracker` handles a few platform-specific issues:

### macOS modifier key behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this so held key state stays accurate.

### Window blur

When the browser window loses focus, the tracker clears all held keys. Otherwise a key released after tabbing away would appear "stuck" forever.

### Missed modifier releases

System shortcuts and browser tools can consume a modifier's `keyup` event without blurring the page. On the next keyboard event, mouse movement, or mouse button press, the tracker checks that event's modifier flags and removes any tracked Control, Alt, Shift, or Meta keys that are no longer active. This updates `useKeyHold`, `useHeldKeys`, and `useHeldKeyCodes` together. Modifiers still reported as active remain held, including when both left and right modifier keys are pressed.

Recovery requires another event that reports the modifier state or a window blur. If neither arrives, the tracker cannot tell a missed release from a continued hold. It does not expire held keys after a timeout or infer physical key codes from modifier flags alone.

## Under the hood

All three hooks subscribe to the singleton `KeyStateTracker` via `@tanstack/react-store`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store, which the hooks subscribe to reactively.

```tsx
import { getKeyStateTracker } from '@tanstack/react-hotkeys'

const tracker = getKeyStateTracker()

// Imperative access (also available inside callbacks)
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
