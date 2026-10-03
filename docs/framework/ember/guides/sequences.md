---
title: Sequences Guide
id: sequences
---

A sequence is an ordered list of chords. Use `useHotkeySequence` for one sequence and `useHotkeySequences` for a changing list. A chord can be a logical binding such as `G`, a physical position such as `[KeyG]`, or a modifier combination such as `Mod+[KeyK]`.

## Reactive options

Sequence options support the same [property getter patterns](./hotkeys.md#property-getters) as hotkey options, including `enabled`, `timeout`, and `target`. Updates preserve the registration when its sequence, target, and platform stay the same.

## Basic usage


```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { array } from '@ember/helper'
import { useHotkeySequence, useHotkeySequences } from '@tanstack/ember-hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/ember-hotkeys'

export default class Navigation extends Component {
	@tracked enabled = true
	@tracked timeout = 1000
	goToTop = () => window.scrollTo({ top: 0 })
	definitions: Array<HotkeySequenceDefinition> = [
		{ sequence: ['D', 'D'], callback: () => console.log('Delete line') },
		{ sequence: ['D', 'W'], callback: () => console.log('Delete word'), options: { timeout: 500 } },
	]
	<template>
		{{useHotkeySequence (array 'G' 'G') this.goToTop enabled=this.enabled timeout=this.timeout}}
		{{useHotkeySequences this.definitions enabled=this.enabled}}
		<p>Press G twice to scroll to the top.</p>
	</template>
}
```

The user must press and release each chord in order. The timeout applies between consecutive steps, rather than to the total duration of the sequence.

## Many sequences at once

`useHotkeySequences` accepts an array of [HotkeySequenceDefinition](../../../reference/adapter/interfaces/HotkeySequenceDefinition) entries. Each contains `sequence`, `callback`, and optional `options`. An empty array removes all registrations owned by that call. Per-definition options override common options. Pass a tracked array or a getter derived from tracked state to the helper. Replace the array when changing its entries.

## Sequence options

### `timeout`

The default is `1000` milliseconds between steps. A shorter timeout, such as `500`, requires faster entry; `2000` gives users more time. Expired sequences reset their progress.

### `enabled`

The default is `true`. Disabled sequences remain in the registry but do not execute. Pass a reactive flag to change this without discarding the registration.

### Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Use the returned contextual helpers and recorder factories. Pass the scope through component arguments to share it with descendants; helpers and recorders still clean up with their own owners. Pass a getter for tracked defaults. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](../quick-start.md#shared-defaults) for a complete example.

### Targets, input handling, and propagation

Sequences support `target`, `ignoreInputs`, `preventDefault`, `stopPropagation`, `platform`, and `conflictBehavior`. Use a focusable element to scope a sequence to a widget, and `null` while that element is unavailable. When omitted, `ignoreInputs` follows the first step: Control/Meta combinations and Escape work in inputs, while other first steps are ignored there. Set it explicitly to override that behavior. See the [target examples](./hotkeys.md#target).

### Metadata

Attach a `meta` object with a name, description, and group. Read it through live registration views to build help panels. Metadata does not change execution scope.

```hbs
{{useHotkeySequence (array 'G' 'G') this.goToTop meta=(hash name='Go to top' group='Navigation')}}
```

Import `array` and `hash` from `@ember/helper` for this template expression.

## Sequences with modifiers

Use `Mod+K`, then `Mod+C` for an editor-style comment shortcut. Logical and physical steps can be mixed.

```hbs
{{useHotkeySequence (array 'Mod+K' 'Mod+C') this.comment}}
```

## Chained modifier chords

Physical codes retain the same positions even when the keyboard layout changes.

```hbs
{{useHotkeySequence (array 'Shift+[KeyR]' 'Shift+[KeyT]') this.nextAction}}
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

```hbs
{{useHotkeySequence (array 'ArrowUp' 'ArrowUp' 'ArrowDown' 'ArrowDown' 'ArrowLeft' 'ArrowRight' 'ArrowLeft' 'ArrowRight' 'B' 'A') this.unlock timeout=2000}}
```

## How sequences work

The shared `SequenceManager` tracks every registration independently. Matching the next expected step advances progress. Completing all steps invokes the callback. The manager resets progress when the timeout expires and prefers exact key matches over weaker logical-key fallbacks.

### Overlapping sequences

`['D', 'D']`, `['D', 'W']`, and `['D', 'I', 'W']` can share a prefix. Pressing D advances each matching sequence; later steps determine which one completes.

### Conflicting registrations

Duplicate detection compares resolved steps on the same target. Modifier aliases, modifier order, and logical letter casing do not create distinct bindings. Physical and logical identities remain distinct. Sharing a prefix alone is not a duplicate registration, but recorder conflict checks also inspect prefixes and physical/logical overlap.

### Updates and cleanup

`useHotkey`, `useHotkeys`, `useHotkeySequence`, and `useHotkeySequences` are template helpers. Invoke them with `{{...}}`, not as JavaScript hooks. Tracked arguments update registrations after rendering. Removing a helper from the template unregisters its bindings.

State readers and recorders are JavaScript functions. Pass the containing component as their first argument, usually `this`. The adapter releases subscriptions and recorders when that owner is destroyed. State readers expose `.value`; recorder fields and registration arrays are reactive getters. Read those properties in templates or getters instead of destructuring an initial snapshot.

## The sequence manager

Use `getSequenceManager()` for the shared registry. For standalone matching without registration, create your own matcher and remove your event listener when its owner is destroyed.

```ts
import { createSequenceMatcher } from '@tanstack/ember-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
const onKeyDown = (event: KeyboardEvent) => {
	if (matcher.match(event)) console.log('Sequence completed')
	console.log(matcher.getProgress())
}
document.addEventListener('keydown', onKeyDown)
// During teardown:
document.removeEventListener('keydown', onKeyDown)
```

Try [useHotkeySequence](../examples/useHotkeySequence) and [useHotkeySequences](../examples/useHotkeySequences).
