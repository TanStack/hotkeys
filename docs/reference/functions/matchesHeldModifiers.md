---
id: matchesHeldModifiers
title: matchesHeldModifiers
---

```ts
function matchesHeldModifiers(
   hotkey,
   heldKeys,
   options): boolean;
```

Defined in: [hint.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hint.ts#L23)

Returns whether held modifiers should reveal a shortcut hint.
By default, any nonempty subset of the binding's modifiers qualifies; an
unrelated modifier hides the hint. `exact` requires every binding modifier.
Nonmodifier keys are ignored. This does not check registration or focus.

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### heldKeys

readonly `string`[]

### options

[`HeldModifierOptions`](../interfaces/HeldModifierOptions.md) = `{}`

## Returns

`boolean`

## Example

```ts
matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt']) // true
matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Control']) // false
```
