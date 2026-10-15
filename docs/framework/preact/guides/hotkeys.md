---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` hook is the primary way to register keyboard shortcuts in Preact applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and Preact ref support.

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both. Sequence-specific behavior is covered in the [Sequences Guide](./sequences). To declare hotkeys up front and let users customize them, see the [App Hotkeys Guide](./app-hotkeys).

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

Pass an array of chords to register a sequence with the same hook:

```tsx
useHotkey(['G', 'G'], () => scrollToTop())
useHotkey(['Mod+K', 'Mod+C'], () => commentSelection())
```

A one-step array such as `['Mod+S']` registers the chord `'Mod+S'`.

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

## Updating options

Pass current options when the component renders. Hooks synchronize those options with the existing registration. You do not need to call `setOptions` in application code. Provider defaults and recorder options follow the same component update lifecycle.

Property getters are read when the hook runs. They do not subscribe to external state independently of the component. Keep changing values in framework state so the component updates, and avoid creating an options object once with an initial state snapshot.

## Capture phase

Set `capture: true` to handle a shortcut before a descendant widget's keyboard listener. The default is `false`, which listens during bubbling. This option applies to both `keydown` and `keyup`.

With the default `stopPropagation: true`, a matching capture listener on an ancestor prevents the event from reaching the widget. Set `stopPropagation: false` to let the event continue. `preventDefault` controls the browser's default action independently. Other listeners on the same target still run. Capture does not override earlier capture listeners on ancestors. A `window` capture listener that stops propagation also blocks document listeners, including key-state tracking.

Capture and bubble registrations on the same target dispatch separately. Match precedence applies within each phase. Equivalent bindings on the same target still follow `conflictBehavior` across phases. Use `conflictBehavior: 'allow'` for intentional duplicates.

Changing `capture` through reactive options preserves the registration ID, trigger count, and `requireReset` state. A registration already processed in one phase cannot process the same event again after moving to another phase. Active shortcut recording also suppresses capture registrations.

For example, intercept an application's close-view shortcut before a tab widget treats it as a bare Backspace:

```tsx
useHotkey('Mod+Backspace', () => closeView(), { capture: true })
```

## Default options

When you register a hotkey without options, or omit specific ones, these defaults apply:

```tsx
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  capture: false,
  requireReset: false, // chords only
  timeout: 1000, // sequences only
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

### Chord and sequence options

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects `timeout` on a chord and `requireReset` on a sequence:

```tsx
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When the kind is not known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted.

### Global defaults via provider

You can change the default options for all `useHotkey` and `useHotkeys` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults. Defaults apply only to the kinds that support them, so a default `timeout` affects sequences and a default `requireReset` affects chords.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false, timeout: 1500 },
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

When `true`, a chord fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`. Sequences ignore automatic repeats already, so this option applies only to chords.

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

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or a Preact ref.

```tsx
import { useRef } from 'preact/hooks'

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

Duplicate detection compares resolved hotkeys on the same target, so `Mod+S` and `Meta+S` conflict on macOS. Two sequences conflict when their steps are equal; a shared prefix alone is not a duplicate.

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
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

Each definition's `options` are typed by its `hotkey`, just like `useHotkey`.

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones. Options merge in this order: `HotkeysProvider` defaults, then the common options, then each definition's options. A common `timeout` or `requireReset` applies only to the definitions of the matching kind.

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

The hook diffs the array between renders by array index plus the normalized hotkey, registering new hotkeys and unregistering removed ones automatically. Reordering the array changes that identity, so reordered entries are unregistered and re-registered even if their callback references stay the same.

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

Use the `useHotkeyRegistrations` hook to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/preact-hotkeys'

function ShortcutPalette() {
  const registrations = useHotkeyRegistrations()

  return (
    <ul>
      {registrations.map((reg) => (
        <li key={reg.id}>
          <kbd>{formatForDisplay(reg.hotkey)}</kbd>
          {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
          {reg.kind === 'sequence' && (
            <small>
              {reg.matchedStepCount}/{reg.hotkey.length} steps
            </small>
          )}
        </li>
      ))}
    </ul>
  )
}
```

Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./app-hotkeys).

## The hotkey manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`, which handles chords and sequences alike. You can access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/preact-hotkeys'

const manager = getHotkeyManager()

// Register outside Preact; returns a handle with setOptions and unregister
const handle = manager.register(['G', 'G'], () => scrollToTop(), { timeout: 500 })

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()

// Reset in-progress sequences
manager.resetSequenceProgress()
```

The manager attaches event listeners per target element, so only elements with registered hotkeys get listeners. That beats a single global listener that has to inspect every keystroke.
