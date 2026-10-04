---
title: Sequences Guide
id: sequences
---

A sequence is an ordered list of chords. Use `useHotkeySequence` for one sequence and `useHotkeySequences` for a changing list. A chord can be a logical binding such as `G`, a physical position such as `[KeyG]`, or a modifier combination such as `Mod+[KeyK]`.

## Basic usage


```tsx
import { useState } from 'octane'
import { useHotkeySequence, useHotkeySequences } from '@tanstack/octane-hotkeys'

export function Navigation() @{
	const [enabled, setEnabled] = useState(true)
	useHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }), { enabled, timeout: 1000 })
	useHotkeySequences([
		{ sequence: ['D', 'D'], callback: () => console.log('Delete line') },
		{ sequence: ['D', 'W'], callback: () => console.log('Delete word'), options: { timeout: 500 } },
	], { enabled })
	<div>
		<button type="button" onClick={() => setEnabled(!enabled)}>Toggle sequences</button>
	</div>
}
```

The user must press and release each chord in order. The timeout applies between consecutive steps, rather than to the total duration of the sequence.

## Many sequences at once

`useHotkeySequences` accepts an array of [HotkeySequenceDefinition](../../../reference/adapter/interfaces/HotkeySequenceDefinition) entries. Each contains `sequence`, `callback`, and optional `options`. An empty array removes all registrations owned by that call. Per-definition options override common options. Derive the array from component state and keep the hook call at a stable call site.

## Sequence options

### `timeout`

The default is `1000` milliseconds between steps. A shorter timeout, such as `500`, requires faster entry; `2000` gives users more time. Expired sequences reset their progress.

### `enabled`

The default is `true`. Disabled sequences remain in the registry but do not execute. Pass a reactive flag to change this without discarding the registration.

### Shared defaults

Set `hotkeySequence` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](../quick-start.md#default-options-provider).

### Targets, input handling, and propagation

Sequences support `target`, `ignoreInputs`, `preventDefault`, `stopPropagation`, `platform`, and `conflictBehavior`. Use a focusable element to scope a sequence to a widget, and `null` while that element is unavailable. When omitted, `ignoreInputs` follows the first step: Control/Meta combinations and Escape work in inputs, while other first steps are ignored there. Set it explicitly to override that behavior. See the [target examples](./hotkeys.md#target).

### Metadata

Attach a `meta` object with a name, description, and group. Read it through live registration views to build help panels. Metadata does not change execution scope.

```tsx
useHotkeySequence(['G', 'G'], () => window.scrollTo({ top: 0 }), { meta: { name: 'Go to top', group: 'Navigation' } })
```

## Sequences with modifiers

Use `Mod+K`, then `Mod+C` for an editor-style comment shortcut. Logical and physical steps can be mixed.

```tsx
useHotkeySequence(['Mod+K', 'Mod+C'], () => console.log("Comment selection"))
```

## Chained modifier chords

Physical codes retain the same positions even when the keyboard layout changes.

```tsx
useHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => console.log("Next action"))
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

```tsx
useHotkeySequence(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
	'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A'], () => console.log("Unlocked"), { timeout: 2000 })
```

## How sequences work

The shared `SequenceManager` tracks every registration independently. Matching the next expected step advances progress. Completing all steps invokes the callback. The manager resets progress when the timeout expires and prefers exact key matches over weaker logical-key fallbacks.

### Overlapping sequences

`['D', 'D']`, `['D', 'W']`, and `['D', 'I', 'W']` can share a prefix. Pressing D advances each matching sequence; later steps determine which one completes.

### Conflicting registrations

Duplicate detection compares resolved steps on the same target. Modifier aliases, modifier order, and logical letter casing do not create distinct bindings. Physical and logical identities remain distinct. Sharing a prefix alone is not a duplicate registration, but recorder conflict checks also inspect prefixes and physical/logical overlap.

### Updates and cleanup

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler supplies hook identity, so call hooks at stable component call sites. Use the plural hooks for lists that change length. Do not supply the compiler's internal slot argument yourself.

Registration callbacks and options refresh after each commit. Registrations and recorder subscriptions are released when the component unmounts. Element targets are DOM nodes, not React ref objects. Use a callback ref that updates component state so the hook sees a newly mounted or replaced element.

## The sequence manager

Use `getSequenceManager()` for the shared registry. For standalone matching without registration, create your own matcher and remove your event listener when its owner is destroyed.

```ts
import { createSequenceMatcher } from '@tanstack/octane-hotkeys'

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
