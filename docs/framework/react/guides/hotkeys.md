---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` hook is the primary way to register keyboard shortcuts in React applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and React ref support.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.

## Basic usage

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
useHotkey({ code: 'NumpadAdd', mod: true }, () => zoomIn())
useHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Default options

When you register a hotkey without options, or omit specific ones, these defaults apply:

```tsx
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  target: document,
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
```

### Why these defaults?

Most hotkey registrations exist to override the browser. When you bind `Mod+S` to save a document, you don't want the browser's "Save Page" dialog too. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling with `ignoreInputs`

By default, `Ctrl`/`Meta` shortcuts (like `Mod+S`) and `Escape` fire even while focus is inside a text field or textarea, so save and close work wherever the user happens to be. Single keys and `Shift`/`Alt` combos are ignored inside non-button inputs, because those are just typing. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) don't block any hotkeys.

#### Hotkey conflicts and `conflictBehavior`

If you register a hotkey that's already registered somewhere else in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). That surfaces accidental duplicate bindings during development, before they reach production.

### Global defaults via provider

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

## Hotkey options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

Disabled hotkeys stay registered in the manager and visible in devtools; only execution is suppressed. The hook updates `enabled` on the existing registration instead of unregistering and re-registering.

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

When `true`, the hotkey will not fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored, so shortcuts like Mod+S work when the user has tabbed to a form button. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```tsx
// Single key - ignored in inputs by default (smart default)
useHotkey('K', () => openSearch())

// Mod+S and Escape - fire in inputs by default (smart default)
useHotkey('Mod+S', () => save())
useHotkey('Escape', () => closeDialog())

// Override: force a single key to fire in inputs
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

Set `ignoreInputs: false` or `true` explicitly to override the smart default.

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

## Stale closure prevention

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

## Automatic cleanup

The hook automatically unregisters the hotkey when the component unmounts:

```tsx
function TemporaryPanel() {
  // Automatically cleaned up when this component unmounts
  useHotkey('Escape', () => closePanel())

  return <div>Panel content</div>
}
```

## Registering multiple hotkeys

To register several hotkeys at once, or a dynamic list whose length isn't known at compile time, use the `useHotkeys` (plural) hook instead of calling `useHotkey` multiple times. You can't call hooks conditionally or in loops, so a single hook that takes an array is the way to handle a variable number of shortcuts.

```tsx
import { useHotkeys } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```tsx
useHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic hotkey lists

Because `useHotkeys` accepts a plain array, you can derive it from data:

```tsx
function MenuShortcuts({ items }) {
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

The hook diffs the array between renders by array index plus the normalized hotkey string, registering new hotkeys and unregistering removed ones automatically. Reordering the array changes that identity, so reordered entries are unregistered and re-registered even if their callback references stay the same.

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```tsx
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use the `useHotkeyRegistrations` hook to get a live view of all hotkey and sequence registrations. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/react-hotkeys'

function ShortcutPalette() {
  const { hotkeys, sequences } = useHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        {hotkeys.map((reg) => (
          <li key={reg.id}>
            <kbd>{formatForDisplay(reg.hotkey)}</kbd>
            {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
            {reg.options.meta?.description && <p>{reg.options.meta.description}</p>}
          </li>
        ))}
      </ul>
      {sequences.length > 0 && (
        <>
          <h2>Sequences</h2>
          <ul>
            {sequences.map((reg) => (
              <li key={reg.id}>
                <kbd>{reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

## The hotkey manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`. You can access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/react-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements with registered hotkeys get listeners. That beats a single global listener that has to inspect every keystroke.
