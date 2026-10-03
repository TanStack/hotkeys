---
title: Hotkeys Guide
id: hotkeys
---

`useHotkey` registers a shortcut with the shared `HotkeyManager`. `useHotkey`, `useHotkeys`, `useHotkeySequence`, and `useHotkeySequences` are template helpers. Invoke them with `{{...}}`, not as JavaScript hooks. Tracked arguments update registrations after rendering. Removing a helper from the template unregisters its bindings.

State readers and recorders are JavaScript functions. Pass the containing component as their first argument, usually `this`. The adapter releases subscriptions and recorders when that owner is destroyed. State readers expose `.value`; recorder fields and registration arrays are reactive getters. Read those properties in templates or getters instead of destructuring an initial snapshot.

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


```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useHotkey, formatForDisplay } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
	@tracked count = 0
	@tracked enabled = true
	save = () => this.count++
	toggle = () => { this.enabled = !this.enabled }
	label = formatForDisplay('Mod+S')

	<template>
		{{useHotkey 'Mod+S' this.save enabled=this.enabled}}
		<button type="button" {{on 'click' this.toggle}}>Toggle shortcut</button>
		<p>Press <kbd>{{this.label}}</kbd>. Saved {{this.count}} times.</p>
	</template>
}
```

### Callback context

Callbacks receive the original `KeyboardEvent` and `HotkeyCallbackContext`. Read `context.hotkey` for the normalized binding and `context.parsedHotkey` for its resolved identity. Narrow `parsed.code !== undefined` before reading a physical code.

```ts
import type { HotkeyCallback } from '@tanstack/ember-hotkeys'

const save: HotkeyCallback = (event, context) => {
	console.log(event.type, context.hotkey, context.parsedHotkey)
}
```

### Raw object bindings

Use either `key` for a logical character or `code` for a physical position. Modifier flags are optional. `mod` selects Command on macOS and Control elsewhere.

```hbs
{{useHotkey (hash key='S' mod=true) this.save}}
```

Import `hash` from `@ember/helper` for inline objects, or pass a component property containing a typed `RawHotkey`.

### Changing a binding

Keep the binding in application state. Recorder results such as `Alt+[KeyS]` can be passed directly to the registration API. Keep an initial binding separately if the UI needs a reset button.

```hbs
{{useHotkey this.binding this.save}}
```

## Property getters

Registration helpers track named arguments and property getters inside definition arrays. You can keep the array stable while a getter reads tracked state:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { HotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
	@tracked enabled = true

	definitions: Array<HotkeyDefinition> = [{
		hotkey: 'Mod+S',
		callback: () => console.log('Save'),
		options: this.createOptions(),
	}]

	createOptions() {
		const component = this
		return {
			get enabled() {
				return component.enabled
			},
		}
	}

	<template>{{useHotkeys this.definitions}}</template>
}
```

The helper reads getters during rendering and applies registration changes after rendering. This also works with `useHotkeySequences`. For a single registration, pass tracked named arguments such as `enabled=this.enabled`. Scope defaults and recorder options accept property getters or functions returning options. Recorders read current options during the active session without requiring a render.

Getters must read tracked state. A plain `{ enabled: this.enabled }` stored once does not track later changes. Callbacks remain functions and are not invoked to resolve options.

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

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Use the returned contextual helpers and recorder factories. Pass the scope through component arguments to share it with descendants; helpers and recorders still clean up with their own owners. Pass a getter for tracked defaults. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](../quick-start.md#shared-defaults) for a complete example.

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


For shortcuts scoped to a rendered element, use the `onHotkey` modifier. It registers on that element and unregisters when the element is removed. Named options stay reactive.

```gts
import Component from '@glimmer/component'
import { onHotkey } from '@tanstack/ember-hotkeys'

export default class Panel extends Component {
	close = () => console.log('Close focused panel')

	<template>
		<div tabindex="0" {{onHotkey 'Escape' this.close}}>
			Focus here and press Escape.
		</div>
	</template>
}
```

Use `onHotkeys` for a changing list:

```hbs
<fieldset {{onHotkeys this.definitions ignoreInputs=false}}>
	<textarea></textarea>
</fieldset>
```

Both modifiers use their containing element as the target, including for individual definitions. Use the `useHotkey` and `useHotkeys` helpers when you need a different target such as `window`. The modifiers are also available from `createHotkeysScope` and inherit its `hotkey` defaults.

### `conflictBehavior`

Duplicate registrations on the same target use one of these policies:

- `'warn'`: log a warning and keep both registrations.
- `'error'`: throw an error.
- `'replace'`: replace the existing registration.
- `'allow'`: keep both without warning.

### `platform`

Pass `'mac'`, `'windows'`, or `'linux'` to override detection. Use the same platform when formatting labels or calculating modifier hints.

## Current callbacks and automatic cleanup

`useHotkey`, `useHotkeys`, `useHotkeySequence`, and `useHotkeySequences` are template helpers. Invoke them with `{{...}}`, not as JavaScript hooks. Tracked arguments update registrations after rendering. Removing a helper from the template unregisters its bindings.

State readers and recorders are JavaScript functions. Pass the containing component as their first argument, usually `this`. The adapter releases subscriptions and recorders when that owner is destroyed. State readers expose `.value`; recorder fields and registration arrays are reactive getters. Read those properties in templates or getters instead of destructuring an initial snapshot.

## Registering multiple hotkeys

Use `useHotkeys` to register a dynamic list. Per-definition options override common options. Removing an entry unregisters it. Each entry has the shared [HotkeyDefinition](../../../reference/adapter/interfaces/HotkeyDefinition) shape.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useHotkeys } from '@tanstack/ember-hotkeys'
import type { HotkeyDefinition } from '@tanstack/ember-hotkeys'

export default class Menu extends Component {
	@tracked enabled = true
	@tracked shortcuts: Array<HotkeyDefinition> = [
		{ hotkey: 'Mod+S', callback: () => console.log('Save') },
		{ hotkey: 'Mod+Z', callback: () => console.log('Undo'), options: { enabled: false } },
	]
	<template>{{useHotkeys this.shortcuts enabled=this.enabled}}</template>
}
```

Replace the tracked array when adding or removing entries, or derive it in a getter from tracked application state.

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

Read `hotkeys` and `sequences` from `useHotkeyRegistrations(this)`. Disabled entries stay listed; destroyed registrations disappear. Both arrays include options and metadata. Hotkey views include enabled state and trigger counts; sequence views include sequence steps and progress.

```gts
import Component from '@glimmer/component'
import { useHotkey, useHotkeyRegistrations, formatForDisplay } from '@tanstack/ember-hotkeys'

export default class Shortcuts extends Component {
	registrations = useHotkeyRegistrations(this)
	meta = { name: 'Save', description: 'Save the document', group: 'File' }
	save = () => console.log('Saved')
	<template>
		{{useHotkey 'Mod+S' this.save meta=this.meta}}
		<ul>
			{{#each this.registrations.hotkeys key='id' as |registration|}}
				<li><kbd>{{formatForDisplay registration.hotkey}}</kbd> {{registration.options.meta.name}}</li>
			{{/each}}
		</ul>
	</template>
}
```

Read `registrations.sequences` in the same way. Format each sequence step with `formatForDisplay` and join the labels with an arrow. Group entries by `registration.options.meta?.group` when building a help panel.

## The hotkey manager

The manager is a shared singleton. The adapter owns registrations, not the manager itself. Do not destroy the singleton when a component unmounts.

```ts
import { getHotkeyManager } from '@tanstack/ember-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

Try the [useHotkey example](../examples/useHotkey), [useHotkeys example](../examples/useHotkeys), and [kitchen sink](../examples/kitchen-sink). See the [API reference](../reference/index) for full signatures.
