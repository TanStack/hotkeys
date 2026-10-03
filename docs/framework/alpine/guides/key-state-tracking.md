---
title: Key State Tracking Guide
id: key-state-tracking
---

Use `createHeldKeys`, `createHeldKeyCodes`, and `createKeyHold` to render the current keyboard state. Use `createHotkeyHint` to reveal shortcut labels while their modifiers are held.

## Read key state


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

## `createHeldKeys`

Returns a reactive `.value` containing an array of held logical key names, in press order. Names include `Shift`, `Control`, `Meta`, `A`, `Space`, and `ArrowUp`. An empty array means no keys are held.

## `createHeldKeyCodes`

Returns a reactive `.value` containing an object that maps logical names to physical `event.code` values, such as `{ Shift: 'ShiftLeft', Control: 'ControlRight' }`. This lets a debugging display show the physical position associated with a held logical name.

## `createKeyHold`

Returns a reactive `.value` containing a boolean for one key. Create separate readers for Shift, Control, Alt, and Meta to show modifier indicators.

Read `.value` in a template or reactive getter. Pass a getter for the key argument when it can change.

## Common patterns

### Reading held keys inside a stable callback

For an event handler that needs current state without a render subscription, initialize the shared tracker before the keys are pressed and read it inside the callback:

```ts
import { getKeyStateTracker } from '@tanstack/alpine-hotkeys'

const tracker = getKeyStateTracker()
const logHeldKeys = () => {
	console.log(tracker.getHeldKeys())
	console.log('Space held:', tracker.isKeyHeld('Space'))
}
```

Saving the result outside the callback captures an earlier snapshot. These imperative reads do not subscribe the component. Do not destroy the shared tracker when your component is removed.

For a mouse or wheel handler that needs only the event's modifiers, read them directly:

```ts
const onWheel = (event: WheelEvent) => {
	if (event.ctrlKey) console.log('Wheel with Control modifier')
}
```

A browser may also report `ctrlKey` for a trackpad pinch. That does not necessarily mean a physical Control key is held.

### Hold-to-reveal UI

Use the Shift state to switch between Move to Trash and Delete Permanently actions. The key-state example above shows a button only while Shift is held. The same pattern can reveal alternate menu labels or selection controls.

### Keyboard shortcut hints

Use a binding-aware hint reader rather than hardcoding Meta on every platform. `Mod+S` follows the detected platform. A hint is display state, not a registration or a check that a target is focused.

### Debugging key display

Combine held logical names with the physical-code map. Format a logical name through `formatForDisplay` when it is also a valid `RegisterableHotkey`, and show the code next to it. Keep physical codes in the diagnostic display even when a layout produces a different logical letter.

## Modifier-held shortcut hints


```ts
const hint = scope.createHotkeyHint('Alt+Shift+[KeyK]')
// Read hint.value in an Alpine template or effect.
```

Holding Alt, Shift, or both reveals this hint. Extra Control hides it, as does releasing all modifiers or blurring the window. Nonmodifier keys are ignored. AltGraph never reveals hints.

Pass `{ exact: true }` to require every binding modifier, or `{ platform: 'mac' }` to resolve `Mod` explicitly. Supply the same platform used for registration. Combine the result with the action's enabled state. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.

For a changing binding, use `scope.createHotkeyHint(() => this.binding, () => this.hintOptions)`. Read `.value` in reactive code so binding changes are tracked even without a keyboard event.

## Platform quirks

### macOS modifier key behavior

macOS can swallow the keyup event for a non-modifier while a modifier is held. The tracker handles this to keep held state accurate.

### Window blur

The tracker clears held keys when the browser window loses focus. Keys released while another window is active therefore do not remain stuck in the UI.

## Under the hood

Alpine subscribes to the core TanStack Store and releases each subscription with its scope. The shared tracker manages keyboard listeners and exposes imperative queries.

```ts
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
tracker.isAnyKeyHeld(['Shift', 'Control'])
tracker.areAllKeysHeld(['Shift', 'Control'])
```

Try [createHeldKeys](../examples/createHeldKeys), [createKeyHold](../examples/createKeyHold), and the [kitchen sink](../examples/kitchen-sink).
