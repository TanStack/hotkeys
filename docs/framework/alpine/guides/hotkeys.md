---
title: Hotkeys Guide
id: hotkeys
---

`createHotkey` registers a shortcut with the shared `HotkeyManager`. Create one scope for each Alpine component. Register shortcuts in `init()` so getters and callbacks read the reactive component instance. Call `scope.destroy()` from the component's `destroy()` method. Destruction releases registrations, effects, Store subscriptions, and active recorders. Do not reuse a destroyed scope.

Pass getters for bindings and options that can change. A value such as `{ enabled: this.enabled }` captures the value at registration time; `() => ({ enabled: this.enabled })` follows Alpine state. State readers return an object with a reactive `.value` getter. Read it in a template or an Alpine effect instead of destructuring it once.

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


```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'

class Editor {
	count = 0
	enabled = true
	scope = createHotkeysScope()
	label = formatForDisplay('Mod+S')

	init() {
		this.scope.createHotkey('Mod+S', () => this.count++,
			() => ({ enabled: this.enabled }))
	}

	destroy() {
		this.scope.destroy()
	}
}

Alpine.data('editor', () => new Editor())
Alpine.start()
```

Use the `editor` markup from the [quick start](../quick-start).

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```ts
this.scope.createHotkey('Mod+S', (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
})
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```ts
this.scope.createHotkey({ key: 'S', mod: true }, () => console.log("Save"))
```

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```ts
this.scope.createHotkey(() => this.binding, () => console.log("Save"))
```

## Property getters

Property getters and functions returning an options object are both supported. Read reactive state inside the getter. A plain value such as `{ enabled: currentValue }` captures the value when that object is created.

The adapter reads option properties inside its reactive computation and updates registrations automatically. Callbacks such as `onRecord` and `onCancel` remain functions; the adapter does not call them to resolve options. Tracking is shallow; callback bodies and nested objects are not evaluated to discover dependencies. Keep getters free of side effects. Ordinary option changes preserve registration identity. Changing the target moves the registration to that target.

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

class Editor {
	enabled = true
	scope = createHotkeysScope()

	init() {
		const component = this
		this.scope.createHotkey('Mod+S', () => console.log('Save'), {
			get enabled() {
				return component.enabled
			},
		})
	}

	destroy() {
		this.scope.destroy()
	}
}

Alpine.data('editor', () => new Editor())
```

You can also pass `() => ({ enabled: this.enabled })` inside `init()`. Capture the component in `init()` so getters read Alpine's reactive proxy. Alpine applies registration changes when its effect runs. Both forms work for scope defaults, common options, sequences, and recorders. Property getters also work in per-definition options.

## Capture phase

Set `capture: true` to handle a shortcut before a descendant widget's keyboard listener. The default is `false`, which listens during bubbling. This option applies to both `keydown` and `keyup`.

With the default `stopPropagation: true`, a matching capture listener on an ancestor prevents the event from reaching the widget. Set `stopPropagation: false` to let the event continue. `preventDefault` controls the browser's default action independently. Other listeners on the same target still run. Capture does not override earlier capture listeners on ancestors. A `window` capture listener that stops propagation also blocks document listeners, including key-state tracking.

Capture and bubble registrations on the same target dispatch separately. Match precedence applies within each phase. Equivalent bindings on the same target still follow `conflictBehavior` across phases. Use `conflictBehavior: 'allow'` for intentional duplicates.

Changing `capture` through reactive options preserves the registration ID, trigger count, and `requireReset` state. A registration already processed in one phase cannot process the same event again after moving to another phase. Active shortcut recording also suppresses capture registrations.

## Default options

| Option | Default | Behavior |
| --- | --- | --- |
| `enabled` | `true` | Execute matching callbacks. |
| `preventDefault` | `true` | Prevent the browser's default action. |
| `stopPropagation` | `true` | Stop the event from bubbling to ancestor listeners. |
| `eventType` | `'keydown'` | Listen on key press rather than release. |
| `requireReset` | `false` | Allow held-key repeats. |
| `ignoreInputs` | Smart default | Allow Control/Meta combinations and Escape in inputs. |
| `target` | `document` | Listen for events that reach the document. |
| `platform` | Detected | Resolve `Mod` for the current platform. |
| `conflictBehavior` | `'warn'` | Warn about duplicate bindings while allowing them. |

These defaults let application shortcuts replace browser shortcuts. Opt out of prevention or propagation control when the browser or an ancestor must also handle the event.

### Smart input handling

By default, Control/Meta shortcuts and Escape work in text inputs, textareas, selects, and contentEditable elements. Single keys and Shift/Alt combinations are ignored there because they can be normal typing. Button-type inputs do not block hotkeys.

### Shared default options

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Pass a getter to follow Alpine state. Each component owns and destroys its scope. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](../quick-start.md#shared-defaults) for a complete example.

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

Use `ignoreInputs: true` to ignore typing targets even for Control/Meta shortcuts. Use `false` to allow a single key such as Enter inside an input. Omitting the option restores smart input handling.

### `target`

Targets can be an element, `document`, or `window`. A `null` target defers registration; an omitted target uses `document`. Changing the target moves the registration and removes listeners from the previous target when no registrations remain.


```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('panel', () => ({
	scope: createHotkeysScope(),
	init() {
		this.scope.createHotkey('Escape', () => console.log('Close focused panel'),
			() => ({ target: this.$refs.panel }))
	},
	destroy() { this.scope.destroy() },
}))
```

```html
<div x-data="panel"><div x-ref="panel" tabindex="0">Focus here and press Escape.</div></div>
```

`$refs` works for elements present when `init()` runs. For conditionally created elements, store the current element in reactive component state and return it from the options getter. Set it to `null` when the element is removed.

### `conflictBehavior`

Duplicate registrations on the same target use one of these policies:

- `'warn'`: log a warning and keep both registrations.
- `'error'`: throw an error.
- `'replace'`: replace the existing registration.
- `'allow'`: keep both without warning.

### `platform`

Pass `'mac'`, `'windows'`, or `'linux'` to override detection. Use the same platform when formatting labels or calculating modifier hints.

## Current callbacks and automatic cleanup

Create one scope for each Alpine component. Register shortcuts in `init()` so getters and callbacks read the reactive component instance. Call `scope.destroy()` from the component's `destroy()` method. Destruction releases registrations, effects, Store subscriptions, and active recorders. Do not reuse a destroyed scope.

Pass getters for bindings and options that can change. A value such as `{ enabled: this.enabled }` captures the value at registration time; `() => ({ enabled: this.enabled })` follows Alpine state. State readers return an object with a reactive `.value` getter. Read it in a template or an Alpine effect instead of destructuring it once.

## Registering multiple hotkeys

Use `createHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [HotkeyDefinition](../../../reference/adapter/interfaces/HotkeyDefinition) shape.

```ts
this.scope.createHotkeys(
	() => this.shortcuts,
	() => ({ enabled: this.enabled }),
)
```

```ts
import type { HotkeyDefinition } from '@tanstack/alpine-hotkeys'

const shortcuts: Array<HotkeyDefinition> = [
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

Read `hotkeys` and `sequences` from `createHotkeyRegistrations()`. Disabled entries stay listed; destroyed registrations disappear. Both arrays include options and metadata. Hotkey views include enabled state and trigger counts; sequence views include sequence steps and progress.

```ts
// Inside init():
this.registrations = this.scope.createHotkeyRegistrations()
this.scope.createHotkey('Mod+S', () => this.save(), {
	meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

```html
<template x-for="registration in registrations.hotkeys" :key="registration.id">
	<p x-text="registration.options.meta?.name + ': ' + registration.hotkey"></p>
</template>
```

Read `registrations.sequences` in the same way. Format each sequence step with `formatForDisplay` and join the labels with an arrow. Group entries by `registration.options.meta?.group` when building a help panel.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/alpine-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [createHotkey example](../examples/createHotkey), [createHotkeys example](../examples/createHotkeys), and [kitchen sink](../examples/kitchen-sink). See the [API reference](../reference/index) for full signatures.
