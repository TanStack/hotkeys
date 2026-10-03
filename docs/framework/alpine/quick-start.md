---
title: Quick Start
id: quick-start
---

Install `@tanstack/alpine-hotkeys` with the [installation instructions](../../installation). This guide builds a save shortcut and shows the component lifecycle used by the other APIs.

## Your first hotkey


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

```html
<div x-data="editor">
	<button type="button" @click="enabled = !enabled">Toggle shortcut</button>
	<p>Press <kbd x-text="label"></kbd>. Saved <span x-text="count"></span> times.</p>
</div>
```

The Alpine adapter runs in the browser. In an application with server rendering, load it only on the client. Load the module after the markup is available. Call `Alpine.start()` once in your application entry point.

Press Command+S on macOS or Control+S on Windows and Linux. The count increases and the browser save dialog is prevented. The toggle disables execution while preserving the registration.

`Mod` resolves to the primary platform modifier. Use `Mod+[KeyS]` instead when the shortcut must follow the physical S position.

## Registration and cleanup

Create one scope for each Alpine component. Register shortcuts in `init()` so getters and callbacks read the reactive component instance. Call `scope.destroy()` from the component's `destroy()` method. Destruction releases registrations, effects, Store subscriptions, and active recorders. Do not reuse a destroyed scope.

Pass getters for bindings and options that can change. A value such as `{ enabled: this.enabled }` captures the value at registration time; `() => ({ enabled: this.enabled })` follows Alpine state. State readers return an object with a reactive `.value` getter. Read it in a template or an Alpine effect instead of destructuring it once.

## Common patterns

### Multiple hotkeys


```ts
this.scope.createHotkey('Mod+S', () => console.log('Save'))
this.scope.createHotkey('Mod+Z', () => console.log('Undo'))
this.scope.createHotkey('Mod+Shift+Z', () => console.log('Redo'))
```

Each registration is independent. For a dynamic list, use `createHotkeys` as shown in the [hotkeys guide](./guides/hotkeys.md#registering-multiple-hotkeys).

### Scoped hotkeys

Pass an actual element as `target`. A `null` target defers registration until the element exists. Make the element focusable with `tabindex="0"`. See the [complete scoped example](./guides/hotkeys.md#target).

### Conditional hotkeys


```ts
this.scope.createHotkey('Mod+S', () => console.log("Save"), () => ({ enabled: this.enabled }))
```

Use Alpine reactive state for the enabled flag.

### Multi-key sequences


```ts
this.scope.createHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }))
```

Release G between presses. Automatic key repeats do not advance sequences.

### Tracking held keys and displaying hints


```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('keyStatus', () => {
	const scope = createHotkeysScope()
	return {
		held: scope.createHeldKeys(),
		codes: scope.createHeldKeyCodes(),
		shift: scope.createKeyHold('Shift'),
		hint: scope.createHotkeyHint('Mod+S'),
		destroy() { scope.destroy() },
	}
})
```

```html
<div x-data="keyStatus">
	<p x-text="held.value.join(' + ') || 'No keys held'"></p>
	<template x-for="key in held.value" :key="key">
		<p x-text="key + ': ' + codes.value[key]"></p>
	</template>
	<button type="button" x-show="shift.value">Delete permanently</button>
	<kbd x-show="hint.value">Save</kbd>
</div>
```

Use `formatForDisplay(binding)` for platform-specific labels. Keep the original binding in state; a display label is not a registration string.

## Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Pass a getter to follow Alpine state. Each component owns and destroys its scope. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults.

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('scopedEditor', () => {
  const scope = createHotkeysScope({
    hotkey: { requireReset: true },
    hotkeySequence: { timeout: 1500 },
    hotkeyRecorder: { ignoreInputs: false },
    hotkeySequenceRecorder: { idleTimeoutMs: 2000 },
  })
  return {
    init() {
      scope.createHotkey('Mod+S', () => console.log('Saved'))
      scope.createHotkey('ArrowRight', () => console.log('Next'), { requireReset: false })
    },
    destroy() { scope.destroy() },
  }
})
```

For changing defaults, create the scope in `init()` with `createHotkeysScope(() => ({ hotkey: { enabled: this.enabled } }))`. Creating the getter in `init()` makes `this` refer to Alpine's reactive component instance. Share a defaults object or getter between components when they need the same policy; give each component its own scope for cleanup. The `$hotkeys` magic uses core defaults, so use an explicit scope when supplying shared defaults.

## Optional Alpine magic

Install `hotkeysPlugin` before `Alpine.start()` to get an element-owned `$hotkeys` scope:

```ts
import Alpine from 'alpinejs'
import { hotkeysPlugin } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)
Alpine.start()
```

```html
<div x-data="{ count: 0 }" x-init="$hotkeys.createHotkey('Mod+S', () => count++)">
	<span x-text="count"></span>
</div>
```

The plugin destroys that scope when Alpine destroys the owning element. Choose an explicit scope or the magic for a registration; using both registers it twice.

## Examples and next steps

- [Hotkeys](./guides/hotkeys)
- [Sequences](./guides/sequences)
- [Hotkey recording](./guides/hotkey-recording)
- [Sequence recording](./guides/sequence-recording)
- [Key state tracking](./guides/key-state-tracking)
- [Formatting and display](./guides/formatting-display)
- [Kitchen sink](./examples/kitchen-sink)
- [API reference](./reference/index)
