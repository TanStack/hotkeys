---
title: Sequences Guide
id: sequences
---

A sequence is an ordered list of chords. Use `createHotkeySequence` for one sequence and `createHotkeySequences` for a changing list. A chord can be a logical binding such as `G`, a physical position such as `[KeyG]`, or a modifier combination such as `Mod+[KeyK]`.

## Capture phase

Sequences accept `capture: true` with the same [event propagation behavior as hotkeys](./hotkeys.md#capture-phase). The default is `false`. Each step is matched in the selected phase, but `preventDefault` and `stopPropagation` apply only when the full sequence completes. Earlier steps still reach descendant widgets. Changing `capture` preserves partial progress and the existing timeout.

## Reactive options

Sequence options support the same [property getter patterns](./hotkeys.md#property-getters) as hotkey options, including `enabled`, `timeout`, and `target`. Updates preserve the registration when its sequence, target, and platform stay the same.

## Basic usage


```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('navigation', () => ({
	enabled: true,
	timeout: 1000,
	scope: createHotkeysScope(),
	init() {
		this.scope.createHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }),
			() => ({ enabled: this.enabled, timeout: this.timeout }))
		this.scope.createHotkeySequences([
			{ sequence: ['D', 'D'], callback: () => console.log('Delete line') },
			{ sequence: ['D', 'W'], callback: () => console.log('Delete word'), options: { timeout: 500 } },
		], () => ({ enabled: this.enabled }))
	},
	destroy() { this.scope.destroy() },
}))
```

```html
<div x-data="navigation">
	<button type="button" @click="enabled = !enabled">Toggle sequences</button>
	<p>Press G twice to scroll to the top.</p>
</div>
```

The user must press and release each chord in order. The timeout applies between consecutive steps, rather than to the total duration of the sequence.

## Many sequences at once

`createHotkeySequences` accepts an array of [HotkeySequenceDefinition](../../../reference/adapter/interfaces/HotkeySequenceDefinition) entries. Each contains `sequence`, `callback`, and optional `options`. An empty array removes all registrations owned by that call. Per-definition options override common options. Pass a getter for a reactive list and for common options that change.

## Sequence options

### `timeout`

The default is `1000` milliseconds between steps. A shorter timeout, such as `500`, requires faster entry; `2000` gives users more time. Expired sequences reset their progress.

### `enabled`

The default is `true`. Disabled sequences remain in the registry but do not execute. Pass a reactive flag to change this without discarding the registration.

### Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Pass a getter to follow Alpine state. Each component owns and destroys its scope. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](../quick-start.md#shared-defaults) for a complete example.

### Targets, input handling, and propagation

Sequences support `target`, `ignoreInputs`, `preventDefault`, `stopPropagation`, `platform`, and `conflictBehavior`. Use a focusable element to scope a sequence to a widget, and `null` while that element is unavailable. When omitted, `ignoreInputs` follows the first step: Control/Meta combinations and Escape work in inputs, while other first steps are ignored there. Set it explicitly to override that behavior. See the [target examples](./hotkeys.md#target).

### Metadata

Attach a `meta` object with a name, description, and group. Read it through live registration views to build help panels. Metadata does not change execution scope.

```ts
this.scope.createHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }), { meta: { name: 'Go to top', group: 'Navigation' } })
```

## Sequences with modifiers

Use `Mod+K`, then `Mod+C` for an editor-style comment shortcut. Logical and physical steps can be mixed.

```ts
this.scope.createHotkeySequence(['Mod+K', 'Mod+C'], () => console.log("Comment selection"))
```

## Chained modifier chords

Physical codes retain the same positions even when the keyboard layout changes.

```ts
this.scope.createHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => console.log("Next action"))
```

### Modifier-only keys between steps

Pressing Shift, Control, Alt, or Meta alone neither advances nor resets an in-progress sequence. Users can release and press Shift between the R and T chords. Modifier-only events, automatic repeats, and IME composition also do not refresh the timeout.

## Common sequence patterns

| Action | Steps |
| --- | --- |
| Go to top | `['G', 'G']` |
| Go to bottom | `['G', 'Shift+G']` |
| Delete line | `['D', 'D']` |
| Delete word | `['D', 'W']` |
| Change inner word | `['C', 'I', 'W']` |
| Open help | `['H', 'E', 'L', 'P']` |

For a Konami-style sequence, use the full ordered list and a longer timeout:

```ts
this.scope.createHotkeySequence(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
	'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A'], () => console.log("Unlocked"), { timeout: 2000 })
```

## How sequences work

The shared `SequenceManager` tracks every registration independently. Matching the next expected step advances progress. Completing all steps invokes the callback. The manager resets progress when the timeout expires and prefers exact key matches over weaker logical-key fallbacks.

### Overlapping sequences

`['D', 'D']`, `['D', 'W']`, and `['D', 'I', 'W']` can share a prefix. Pressing D advances each matching sequence; later steps determine which one completes.

### Conflicting registrations

Duplicate detection compares resolved steps on the same target. Modifier aliases, modifier order, and logical letter casing do not create distinct bindings. Physical and logical identities remain distinct. Sharing a prefix alone is not a duplicate registration, but recorder conflict checks also inspect prefixes and physical/logical overlap.

### Updates and cleanup

Create one scope for each Alpine component. Register shortcuts in `init()` so getters and callbacks read the reactive component instance. Call `scope.destroy()` from the component's `destroy()` method. Destruction releases registrations, effects, Store subscriptions, and active recorders. Do not reuse a destroyed scope.

Pass getters for bindings and options that can change. A value such as `{ enabled: this.enabled }` captures the value at registration time; `() => ({ enabled: this.enabled })` follows Alpine state. State readers return an object with a reactive `.value` getter. Read it in a template or an Alpine effect instead of destructuring it once.

## The sequence manager

Use `getSequenceManager()` for the shared registry. For standalone matching without registration, create your own matcher and remove your event listener when its owner is destroyed.

```ts
import { createSequenceMatcher } from '@tanstack/alpine-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
const onKeyDown = (event: KeyboardEvent) => {
	if (matcher.match(event)) console.log('Sequence completed')
	console.log(matcher.getProgress())
}
document.addEventListener('keydown', onKeyDown)
// During teardown:
document.removeEventListener('keydown', onKeyDown)
```

Try [createHotkeySequence](../examples/createHotkeySequence) and [createHotkeySequences](../examples/createHotkeySequences).
