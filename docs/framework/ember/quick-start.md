---
title: Quick Start
id: quick-start
---

Install `@tanstack/ember-hotkeys` with the [installation instructions](../../installation). This guide builds a save shortcut and shows the component lifecycle used by the other APIs.

## Your first hotkey

Use a strict-mode `.gts` component. Import the template helper into that file.

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

Press Command+S on macOS or Control+S on Windows and Linux. The count increases and the browser save dialog is prevented. The toggle disables execution while preserving the registration.

`Mod` resolves to the primary platform modifier. Use `Mod+[KeyS]` instead when the shortcut must follow the physical S position.

## Registration and cleanup

`useHotkey`, `useHotkeys`, `useHotkeySequence`, and `useHotkeySequences` are template helpers. Invoke them with `{{...}}`, not as JavaScript hooks. Tracked arguments update registrations after rendering. Removing a helper from the template unregisters its bindings.

State readers and recorders are JavaScript functions. Pass the containing component as their first argument, usually `this`. The adapter releases subscriptions and recorders when that owner is destroyed. State readers expose `.value`; recorder fields and registration arrays are reactive getters. Read those properties in templates or getters instead of destructuring an initial snapshot.

## Common patterns

### Multiple hotkeys


```hbs
{{useHotkey 'Mod+S' this.save}}
{{useHotkey 'Mod+Z' this.undo}}
{{useHotkey 'Mod+Shift+Z' this.redo}}
```

Each registration is independent. For a dynamic list, use `useHotkeys` as shown in the [hotkeys guide](./guides/hotkeys.md#registering-multiple-hotkeys).

### Scoped hotkeys

Import `onHotkey` and attach it to the element. It handles registration, reactive options, and cleanup with the element's lifecycle.

```hbs
<div tabindex="0" {{onHotkey 'Escape' this.close enabled=this.enabled}}>
	Focus here and press Escape.
</div>
```

Use `onHotkeys` for an array of definitions. See the [complete scoped example](./guides/hotkeys.md#target).

### Conditional hotkeys


```hbs
{{useHotkey 'Mod+S' this.save enabled=this.enabled}}
```

Use Ember tracked state for the enabled flag.

### Multi-key sequences


```hbs
{{useHotkeySequence (array 'G' 'G') this.goToTop}}
```

Import `array` from `@ember/helper` and `useHotkeySequence` from `@tanstack/ember-hotkeys`.

Release G between presses. Automatic key repeats do not advance sequences.

### Tracking held keys and displaying hints


```gts
import Component from '@glimmer/component'
import { useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint } from '@tanstack/ember-hotkeys'

export default class KeyStatus extends Component {
	held = useHeldKeys(this)
	codes = useHeldKeyCodes(this)
	shift = useKeyHold(this, 'Shift')
	hint = useHotkeyHint(this, 'Mod+S')

	get keys() { return this.held.value.join(' + ') || 'No keys held' }
	get shiftCode() { return this.codes.value.Shift ?? 'Not held' }

	<template>
		<p>{{this.keys}}</p>
		<p>Shift position: {{this.shiftCode}}</p>
		{{#if this.shift.value}}<button type="button">Delete permanently</button>{{/if}}
		{{#if this.hint.value}}<kbd>Save</kbd>{{/if}}
	</template>
}
```

Use `formatForDisplay(binding)` for platform-specific labels. Keep the original binding in state; a display label is not a registration string.

## Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Use the returned contextual helpers, modifiers, and recorder factories. Pass the scope through component arguments to share it with descendants; helpers and recorders still clean up with their own owners. Pass a getter for tracked defaults. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults.

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { createHotkeysScope } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  @tracked enabled = true
  hotkeys = createHotkeysScope(() => ({
    hotkey: { enabled: this.enabled, requireReset: true },
    hotkeySequence: { timeout: 1500 },
    hotkeyRecorder: { ignoreInputs: false },
    hotkeySequenceRecorder: { idleTimeoutMs: 2000 },
  }))
  save = () => console.log('Saved')
  next = () => console.log('Next')

  <template>
    {{this.hotkeys.useHotkey 'Mod+S' this.save}}
    {{this.hotkeys.useHotkey 'ArrowRight' this.next requireReset=false}}
  </template>
}
```

A child can receive this scope as `@hotkeys={{this.hotkeys}}` and call `{{@hotkeys.useHotkey ...}}`. To use recorder defaults, call `this.hotkeys.useHotkeyRecorder(this, options)` or `this.hotkeys.useHotkeySequenceRecorder(this, options)`. The standalone imports use core defaults. The scope itself owns no registrations and needs no `destroy()` call.

## Examples and next steps

- [Hotkeys](./guides/hotkeys)
- [Sequences](./guides/sequences)
- [Hotkey recording](./guides/hotkey-recording)
- [Sequence recording](./guides/sequence-recording)
- [Key state tracking](./guides/key-state-tracking)
- [Formatting and display](./guides/formatting-display)
- [Kitchen sink](./examples/kitchen-sink)
- [API reference](./reference/index)
