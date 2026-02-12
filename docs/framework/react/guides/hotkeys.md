---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` hook is the primary way to register keyboard shortcuts in React applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and React ref support.

## Basic Usage

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function App() {
  useHotkey('Mod+S', () => {
    saveDocument()
  }, {
    // override the default options here
  })
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)       // 'Mod+S'
  console.log(context.parsedHotkey) // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
})
```

You can pass a hotkey as a string or as a `RawHotkey` object (modifier booleans optional). Use `mod` for cross-platform shortcuts (Command on Mac, Control elsewhere):

```tsx
useHotkey('Mod+S', () => save())
useHotkey({ key: 'S', mod: true }, () => save())           // Same as above
useHotkey({ key: 'Escape' }, () => closeModal())
useHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

## Default Options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```tsx
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: true,
  target: document,
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
```

**Why these defaults?** Most hotkey registrations aim to override browser behavior (e.g., `Mod+S` for save instead of the browser's "Save Page" dialog). The library defaults `preventDefault` and `stopPropagation` to `true` so your hotkeys take precedence without extra boilerplate. Input-like elements (inputs, textareas, contenteditable) are ignored by default (`ignoreInputs: true`) so shortcuts don't fire while the user is typing. When a hotkey is already registered, a warning is logged (`conflictBehavior: 'warn'`) to help catch duplicate bindings during development.

### Global Default Options via Provider

You can change the default options for all `useHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false },
  }}
>
  <App />
</HotkeysProvider>
```

## Hotkey Options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

```tsx
const [isEditing, setIsEditing] = useState(false)

// Only active when editing
useHotkey('Mod+S', () => save(), { enabled: isEditing })
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
// Browser default is prevented by default
useHotkey('Mod+S', () => save())

// Opt out when you want the browser's default behavior
useHotkey('Mod+S', () => save(), { preventDefault: false })
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
// Event propagation is stopped by default
useHotkey('Escape', () => closeModal())

// Opt out when you need the event to bubble
useHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
// Fire when the key is released
useHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

### `requireReset`

When `true`, the hotkey will only fire once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
// Only fires once per Escape press, not on key repeat
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true` (the default), the hotkey will not fire when the user is focused on an input, textarea, select, or contentEditable element. This prevents hotkeys from interfering with text input.

```tsx
// This will NOT fire when typing in an input
useHotkey('K', () => openSearch())

// This WILL fire even when typing in an input
useHotkey('Escape', () => closeDialog(), { ignoreInputs: false })
```

Set `ignoreInputs: false` for hotkeys that should always work, like Escape to close a modal.

### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or a React ref.

```tsx
import { useRef } from 'react'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // Only listens for events on this specific element
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      <p>Panel content</p>
    </div>
  )
}
```

> [!NOTE]
> When using a ref as the target, make sure the element is focusable (has `tabIndex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default) - Logs a warning but allows the registration
- `'error'` - Throws an error
- `'replace'` - Replaces the existing registration
- `'allow'` - Allows multiple registrations silently

```tsx
useHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```tsx
useHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Stale Closure Prevention

The `useHotkey` hook automatically syncs the callback on every render, so you never need to worry about stale closures:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // This callback always has access to the latest `count` value
  useHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count)
  })

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

## Automatic Cleanup

The hook automatically unregisters the hotkey when the component unmounts:

```tsx
function TemporaryPanel() {
  // Automatically cleaned up when this component unmounts
  useHotkey('Escape', () => closePanel())

  return <div>Panel content</div>
}
```

## The Hotkey Manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/react-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. This is more efficient than a single global listener.
