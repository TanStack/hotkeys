---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys includes three primitives for tracking the real-time state of keyboard keys. Use them to show modifier state in the UI or to build hold-to-activate features.

## `createHeldKeys`

Returns an accessor that yields an array of all currently held key names.

```tsx
import { createHeldKeys } from '@tanstack/solid-hotkeys'

function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      {heldKeys().length > 0
        ? `Held: ${heldKeys().join(' + ')}`
        : 'No keys held'}
    </div>
  )
}
```

> [!NOTE]
> In Solid, `createHeldKeys()` returns an accessor function. Call it with `()` to read the current value: `heldKeys()`.

The returned array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

## `createHeldKeyCodes`

Returns an accessor that yields a reactive object mapping held key names to their physical key codes (`event.code` values). Useful for distinguishing between left and right modifiers.

```tsx
import { createHeldKeyCodes } from '@tanstack/solid-hotkeys'

function KeyCodeDisplay() {
  const heldCodes = createHeldKeyCodes()
  // Example: { Shift: "ShiftLeft", Control: "ControlRight" }

  return (
    <div>
      <For each={Object.entries(heldCodes())}>
        {([key, code]) => (
          <div>
            {key}: {code}
          </div>
        )}
      </For>
    </div>
  )
}
```

## `createKeyHold`

Returns an accessor that indicates whether a specific key is currently held. Optimized to only trigger updates when the specified key's held state changes. The `key` argument can be a string or an accessor for reactive keys.

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function ModifierIndicators() {
  const isShiftHeld = createKeyHold('Shift')
  const isCtrlHeld = createKeyHold('Control')
  const isAltHeld = createKeyHold('Alt')
  const isMetaHeld = createKeyHold('Meta')

  return (
    <div class="modifier-bar">
      <span classList={{ active: isShiftHeld() }}>Shift</span>
      <span classList={{ active: isCtrlHeld() }}>Ctrl</span>
      <span classList={{ active: isAltHeld() }}>Alt</span>
      <span classList={{ active: isMetaHeld() }}>Meta</span>
    </div>
  )
}
```

## Common patterns

### Hold-to-reveal UI

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function FileItem(props: { file: File }) {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div class="file-item">
      <span>{props.file.name}</span>
      <Show when={isShiftHeld()}>
        <button class="danger" onClick={() => permanentlyDelete(props.file)}>
          Permanently Delete
        </button>
      </Show>
      <Show when={!isShiftHeld()}>
        <button onClick={() => moveToTrash(props.file)}>
          Move to Trash
        </button>
      </Show>
    </div>
  )
}
```

### Keyboard shortcut hints

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function ShortcutHints() {
  const isModHeld = createKeyHold('Meta')

  return (
    <Show when={isModHeld()}>
      <div class="shortcut-overlay">
        <div>S - Save</div>
        <div>Z - Undo</div>
        <div>Shift+Z - Redo</div>
        <div>K - Command Palette</div>
      </div>
    </Show>
  )
}
```

### Debugging key display

```tsx
import {
  createHeldKeys,
  createHeldKeyCodes,
  formatForDisplay,
  type RegisterableHotkey,
} from '@tanstack/solid-hotkeys'

function KeyDebugger() {
  const heldKeys = createHeldKeys()
  const heldCodes = createHeldKeyCodes()

  return (
    <div class="key-debugger">
      <h3>Active Keys</h3>
      <For each={heldKeys()}>
        {(key) => (
          <div>
            <strong>
              {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}
            </strong>
            <span class="code">{heldCodes()[key]}</span>
          </div>
        )}
      </For>
      <Show when={heldKeys().length === 0}>
        <p>Press any key...</p>
      </Show>
    </div>
  )
}
```

## Platform quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

### macOS modifier key behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event. TanStack Hotkeys detects and handles this automatically.

### Window blur

When the browser window loses focus, the tracker clears all held keys.

## Under the hood

All three primitives subscribe to the singleton `KeyStateTracker` via `@tanstack/solid-store`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store.

```tsx
import { getKeyStateTracker } from '@tanstack/solid-hotkeys'

const tracker = getKeyStateTracker()

tracker.getHeldKeys()        // string[]
tracker.isKeyHeld('Shift')   // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```

## Modifier-held shortcut hints

`createHotkeyHint` answers whether held modifiers are relevant to a binding. Keep formatting and badge styling in your component:

```ts
const visible = createHotkeyHint(() => binding()) // accessor: visible()
```

For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both reveals the hint. An extra Control hides it; releasing all modifiers or blurring the window hides it. Nonmodifier keys are ignored. AltGraph does not reveal hints. Pass `{ exact: true }` to require all binding modifiers, or `{ platform: 'mac' }` to resolve Mod explicitly. Supply the same platform used by the registration when overriding detection.

Combine the boolean with the action's enabled state. The helper does not register a shortcut or determine whether its target is focused. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.
