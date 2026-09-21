---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` hook is the primary way to register keyboard shortcuts in Preact applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and Preact ref support.

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
import { useHotkey } from '@tanstack/preact-hotkeys'

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

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

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

Most hotkey registrations are meant to override default browser behavior. `Mod+S` should save your document, not open the browser's "Save Page" dialog. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling: `ignoreInputs`

By default, hotkeys with `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (such as text fields or text areas), and when focus is on button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Shortcuts like save or close keep working wherever the user is focused. Single key shortcuts, and those using only `Shift`/`Alt`, are ignored within non-button inputs so they don't interfere with normal typing.

#### Hotkey conflicts: `conflictBehavior`

When you attempt to register a hotkey that is already registered (possibly in another part of your app), the library logs a warning by default using the `conflictBehavior: 'warn'` setting. This helps you catch accidental duplicate bindings during development so they can be resolved before reaching production.

### Global defaults via provider

You can change the default options for all `useHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

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

Disabled hotkeys remain registered in the manager and stay visible in devtools; only execution is suppressed. Hooks update `enabled` on the existing registration instead of unregistering and re-registering.

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

When `true`, the hotkey only fires once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
// Only fires once per Escape press, not on key repeat
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored, so shortcuts like Mod+S work when the user has tabbed to a form button. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

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

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or a Preact ref.

```tsx
import { useRef } from 'preact/hooks'

function Panel() {
  const panelRef = useRef<HTMLDivElement | null>(null)

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

When you need to register several hotkeys at once, or a dynamic, variable-length list, use the `useHotkeys` (plural) hook instead of calling `useHotkey` multiple times. This matters when the number of shortcuts is not known at compile time, since calling hooks conditionally or in loops violates the rules of hooks.

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

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

Use the `useHotkeyRegistrations` hook to get a live view of all hotkey and sequence registrations. It works well for shortcut palettes, help dialogs, or devtools.

```tsx
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/preact-hotkeys'

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

Under the hood, `useHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/preact-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. That beats a single global listener that has to inspect every keystroke.
