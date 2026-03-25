---
title: Hotkeys Guide
id: hotkeys
---

The `createHotkey` primitive is the primary way to register keyboard shortcuts in SolidJS applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management and reactive option support.

## Basic Usage

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
createHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

## Reactive Options

Unlike React/Preact hooks, Solid primitives accept **accessor functions** for reactive options. Pass a function that returns the options object to have the hotkey automatically update when dependencies change:

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

## Default Options

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

### Why These Defaults?

Most hotkey registrations are intended to override default browser behavior—such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. To make this easy and consistent, the library sets `preventDefault` and `stopPropagation` to `true` by default, ensuring your hotkey handlers take precedence and reducing the amount of repetitive boilerplate code required.

#### Smart Input Handling: `ignoreInputs`

The `ignoreInputs` option is designed to strike a balance between accessibility and usability. By default, hotkeys involving `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key are allowed to fire even when the focus is inside input elements (such as text fields or text areas), and when focused on button-type inputs (`type="button"`, `"submit"`, or `"reset"`). This allows shortcuts like save or close to work wherever the user is focused. On the other hand, single key shortcuts or those using only `Shift`/`Alt` are ignored within non-button inputs to prevent interference with normal typing.

#### Hotkey Conflicts: `conflictBehavior`

When you attempt to register a hotkey that is already registered (possibly in another part of your app), the library logs a warning by default using the `conflictBehavior: 'warn'` setting. This helps you catch accidental duplicate bindings during development so they can be resolved before reaching production.

### Global Default Options via Provider

You can change the default options for all `createHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-primitive options will override the provider defaults.

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

## Hotkey Options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`. Use an accessor for reactive control.

Disabled hotkeys **remain registered** in the manager and stay visible in devtools; only execution is suppressed.

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

When `true`, the hotkey will only fire once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `true`, the hotkey will not fire when the user is focused on a text input, textarea, select, or contentEditable element. When unset, a smart default applies based on the hotkey type.

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

## Automatic Dependency Tracking

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

## Automatic Cleanup

The primitive automatically unregisters the hotkey when the component unmounts (when the owning reactive scope is disposed):

```tsx
function TemporaryPanel() {
  createHotkey('Escape', () => closePanel())
  return <div>Panel content</div>
}
```

## Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use the `createHotkeys` (plural) primitive:

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

### Common Options with Per-Hotkey Overrides

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

### Dynamic Hotkey Lists

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

## The Hotkey Manager

Under the hood, `createHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/solid-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
