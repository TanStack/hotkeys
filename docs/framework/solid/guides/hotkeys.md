---
title: Hotkeys Guide
id: hotkeys
---

The `createHotkey` primitive is the primary way to register keyboard shortcuts in SolidJS applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management and reactive option support.

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
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  createHotkey('Mod+S', () => {
    saveDocument()
  }, {
    // override the default options here
  })
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```tsx
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)       // 'Mod+S'
  console.log(context.parsedHotkey) // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
})
```

You can pass a hotkey as a string or as a `RawHotkey` object (modifier booleans optional). Use `mod` for cross-platform shortcuts (Command on Mac, Control elsewhere):

```tsx
createHotkey('Mod+S', () => save())
createHotkey({ key: 'S', mod: true }, () => save())           // Same as above
createHotkey({ key: 'Escape' }, () => closeModal())
createHotkey({ code: 'NumpadAdd', mod: true }, () => zoomIn())
createHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

## Reactive options

Unlike React/Preact hooks, Solid primitives accept accessor functions for reactive options. Pass a function that returns the options object, and the hotkey updates automatically when dependencies change:

```tsx
function Modal(props) {
  createHotkey('Escape', () => props.onClose(), () => ({
    enabled: props.isOpen,
  }))

  return (
    <Show when={props.isOpen}>
      <div class="modal">...</div>
    </Show>
  )
}
```

For scoped targets, use an accessor so the hotkey waits for the element to be attached:

```tsx
function Editor() {
  const [editorRef, setEditorRef] = createSignal<HTMLDivElement | null>(null)

  createHotkey('Mod+S', save, () => ({ target: editorRef() }))

  return <div ref={setEditorRef}>...</div>
}
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Default options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```tsx
createHotkey('Mod+S', callback, {
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

Most hotkey registrations are meant to override default browser behavior, such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling: `ignoreInputs`

By default, hotkeys with `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (such as text fields or text areas), and when focused on button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Shortcuts like save or close keep working wherever the user is focused. Single-key shortcuts, or those using only `Shift`/`Alt`, are ignored within non-button inputs so they don't interfere with normal typing.

#### Hotkey conflicts: `conflictBehavior`

When you attempt to register a hotkey that is already registered (possibly in another part of your app), the library logs a warning by default using the `conflictBehavior: 'warn'` setting. That helps you catch accidental duplicate bindings during development, before they reach production.

### Global defaults via provider

You can change the default options for all `createHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-primitive options override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

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

Controls whether the hotkey is active. Defaults to `true`. Use an accessor for reactive control.

Disabled hotkeys remain registered in the manager and stay visible in devtools; only execution is suppressed.

```tsx
const [isEditing, setIsEditing] = createSignal(false)

createHotkey('Mod+S', () => save(), () => ({ enabled: isEditing() }))
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Mod+S', () => save())
createHotkey('Mod+S', () => save(), { preventDefault: false })
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Escape', () => closeModal())
createHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
createHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

### `requireReset`

When `true`, the hotkey fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. When unset, a smart default applies based on the hotkey type.

```tsx
createHotkey('K', () => openSearch())  // Smart default: ignored in inputs
createHotkey('Mod+S', () => save())   // Smart default: fires in inputs
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or from an accessor for reactive targets.

```tsx
const [panelRef, setPanelRef] = createSignal<HTMLDivElement | null>(null)

createHotkey('Escape', () => closePanel(), () => ({ target: panelRef() }))

return <div ref={setPanelRef} tabIndex={0}>...</div>
```

> [!NOTE]
> When using an accessor for the target, the primitive waits for the element to be available before registering. Ensure the element is focusable (has `tabIndex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options: `'warn'`, `'error'`, `'replace'`, `'allow'`.

```tsx
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

Override the auto-detected platform.

```tsx
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Automatic dependency tracking

Solid's fine-grained reactivity means `createHotkey` automatically tracks reactive dependencies. The callback always has access to the latest signal values:

```tsx
function Counter() {
  const [count, setCount] = createSignal(0)

  createHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count())
  })

  return <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
}
```

## Automatic cleanup

The primitive automatically unregisters the hotkey when the component unmounts (when the owning reactive scope is disposed):

```tsx
function TemporaryPanel() {
  createHotkey('Escape', () => closePanel())
  return <div>Panel content</div>
}
```

## Registering multiple hotkeys

When you need to register several hotkeys at once, or a dynamic, variable-length list, use the `createHotkeys` (plural) primitive:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```tsx
createHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic hotkey lists

Pass an accessor for reactive arrays:

```tsx
function MenuShortcuts(props) {
  createHotkeys(
    () => props.items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

The primitive tracks dependencies automatically and diffs registrations when the array changes.

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```tsx
createHotkey('Mod+S', () => save(), {
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

createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use the `createHotkeyRegistrations` primitive to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```tsx
import { createHotkeyRegistrations, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutPalette() {
  const registrations = createHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        <For each={registrations().hotkeys}>
          {(reg) => (
            <li>
              <kbd>{formatForDisplay(reg.hotkey)}</kbd>
              {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              {reg.options.meta?.description && <p>{reg.options.meta.description}</p>}
            </li>
          )}
        </For>
      </ul>
      <Show when={registrations().sequences.length > 0}>
        <h2>Sequences</h2>
        <ul>
          <For each={registrations().sequences}>
            {(reg) => (
              <li>
                <kbd>{reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
```

The returned accessor yields an object with a `hotkeys` array and a `sequences` array. Each hotkey entry carries the hotkey string, its options (including `meta`), and its enabled state; sequence entries have the same structure.

## The hotkey manager

Under the hood, `createHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/solid-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
