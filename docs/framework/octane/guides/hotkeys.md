---
title: Hotkeys Guide
id: hotkeys
---

`useHotkey` registers a shortcut with the shared `HotkeyManager`. Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```tsx
useHotkey('Mod+S', () => save()) // chord
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 }) // sequence
useHotkey('Escape', () => close(), { requireReset: true }) // chord-only option
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./sequences) for timing and matching, and the [App Hotkeys Guide](./app-hotkeys) to declare hotkeys up front and let users customize them.

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
import { createRoot, delegateEvents, useState } from 'octane'
import { useHotkey, formatForDisplay } from '@tanstack/octane-hotkeys'

delegateEvents(['click'])

function Editor() @{
	const [count, setCount] = useState(0)
	const [enabled, setEnabled] = useState(true)
	useHotkey('Mod+S', () => setCount((value) => value + 1), { enabled })

	<div>
		<button type="button" onClick={() => setEnabled(!enabled)}>Toggle shortcut</button>
		<p>Press <kbd>{formatForDisplay('Mod+S')}</kbd>. Saved {count} times.</p>
	</div>
}

const root = createRoot(document.getElementById('root')!)
root.render(Editor)
```

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```tsx
useHotkey('Mod+S', (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
})
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```tsx
useHotkey({ key: 'S', mod: true }, () => console.log("Save"))
```

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```tsx
useHotkey(binding, () => console.log("Save"))
```

## Updating options

Pass current options when the component renders. Hooks synchronize those options with the existing registration. You do not need to call `setOptions` in application code. Provider defaults and recorder options follow the same component update lifecycle.

Property getters are read when the hook runs. They do not subscribe to external state independently of the component. Keep changing values in framework state so the component updates, and avoid creating an options object once with an initial state snapshot.

## Default options

| Option | Default | Behavior |
| --- | --- | --- |
| `enabled` | `true` | Execute matching callbacks. |
| `preventDefault` | `true` | Prevent the browser's default action. |
| `stopPropagation` | `true` | Stop the event from bubbling to ancestor listeners. |
| `eventType` | `'keydown'` | Listen on key press rather than release. |
| `requireReset` | `false` | Allow held-key repeats. |
| `ignoreInputs` | `'auto'` | Allow Control/Meta combinations and Escape in inputs. |
| `target` | `document` | Listen for events that reach the document. |
| `platform` | Detected | Resolve `Mod` for the current platform. |
| `conflictBehavior` | `'warn'` | Warn about duplicate bindings while allowing them. |

These defaults let application shortcuts replace browser shortcuts. Opt out of prevention or propagation control when the browser or an ancestor must also handle the event.

### Smart input handling

By default, Control/Meta shortcuts and Escape work in text inputs, textareas, selects, and contentEditable elements. Single keys and Shift/Alt combinations are ignored there because they can be normal typing. Button-type inputs allow unrelated shortcuts while preserving their native activation keys.

### Shared default options

Set `hotkey` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](../quick-start.md#default-options-provider).

## Hotkey options

### `enabled`

Set `enabled` to false to suppress execution. The registration remains in the live registry, and changing this option updates its existing handle.

### `preventDefault`

Set `preventDefault: false` to preserve the browser's action. The default prevents actions such as the browser's Save Page dialog.

### `stopPropagation`

Set `stopPropagation: false` to allow an event to bubble to an ancestor target. This is independent of preventing the browser default.

### `eventType`

Set `eventType: 'keyup'` to execute when the key is released. The default is `'keydown'`.

### `requireReset`

Set `requireReset: true` for actions that must run once per press. The key must be released before another press can trigger the action.

### `ignoreInputs`

When `ignoreInputs` is enabled, hotkeys also skip keys that a focused control inside their `target` uses itself: Enter and Space on buttons and `<summary>`, Enter on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, and grids. A hotkey targeted at the control itself still receives them, and `ignoreInputs: false` handles every key. See [Focused controls keep their own keys](../../../guides/sensible-defaults.md#focused-controls-keep-their-own-keys) for the full list.

Use `ignoreInputs: true` to ignore typing targets even for Control/Meta shortcuts. Use `false` to allow a single key such as Enter inside an input. `'auto'`, the default, restores smart input handling.

### `target`

Targets can be an element, `document`, or `window`. A `null` target defers registration; an omitted target uses `document`. Changing the target moves the registration and removes listeners from the previous target when no registrations remain.


```tsx
import { useState } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

export function Panel() @{
	const [target, setTarget] = useState<HTMLDivElement | null>(null)
	useHotkey('Escape', () => console.log('Close focused panel'), { target })
	<div>
		<div ref={setTarget} tabIndex={0}>Focus here and press Escape.</div>
	</div>
}
```

The callback ref updates state when the element mounts or changes. A ref object is not an accepted target.

### `conflictBehavior`

Duplicate registrations on the same target use one of these policies:

- `'warn'`: log a warning and keep both registrations.
- `'error'`: throw an error.
- `'replace'`: replace the existing registration.
- `'allow'`: keep both without warning.

### `platform`

Pass `'mac'`, `'windows'`, or `'linux'` to override detection. Use the same platform when formatting labels or calculating modifier hints.

## Current callbacks and automatic cleanup

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [UseHotkeyDefinition](../reference/type-aliases/UseHotkeyDefinition.md) shape.

```tsx
useHotkeys(
	shortcuts,
	{ enabled },
)
```

```ts
import type { UseHotkeyDefinition } from '@tanstack/octane-hotkeys'

const shortcuts: Array<UseHotkeyDefinition> = [
	{ hotkey: 'Mod+S', callback: () => console.log('Save') },
	{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
]
```

Derive the definitions from reactive application state. Pass an empty array when no shortcuts should be registered.

The adapter identifies entries by array index, normalized binding, and target. Changing identity replaces the registration; unchanged identities retain their handle and receive updated callbacks and options. Reordering entries can replace registrations.

## Metadata

Attach `meta.name`, `meta.description`, and `meta.group` for a shortcut palette or help panel. Metadata does not change matching, enabled state, or target scope. Extend `HotkeyMeta` through declaration merging for application-specific fields.

```ts
import '@tanstack/hotkeys'

declare module '@tanstack/hotkeys' {
	interface HotkeyMeta {
		icon?: string
	}
}
```

## Introspecting registrations

Use the `useHotkeyRegistrations` hook to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkey, useHotkeyRegistrations, formatForDisplay } from '@tanstack/octane-hotkeys'

export function Shortcuts() @{
	useHotkey('Mod+S', () => console.log('Saved'), {
		meta: { name: 'Save', description: 'Save the document', group: 'File' },
	})
	const registrations = useHotkeyRegistrations()
	<ul>
		@for (const registration of registrations.hotkeys; key registration.id) {
			<li><kbd>{formatForDisplay(registration.hotkey)}</kbd> {registration.options.meta?.name}</li>
		}
	</ul>
}
```

The returned object's `hotkeys` array holds one list of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./app-hotkeys).

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/octane-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](../examples/useHotkey), [useHotkeys example](../examples/useHotkeys), and [kitchen sink](../examples/kitchen-sink). See the [API reference](../reference/index) for full signatures.
