---
id: HotkeyCallback
title: HotkeyCallback
---

```ts
type HotkeyCallback<TContext> = (event, context) => void;
```

Defined in: [hotkey.types.ts:290](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L290)

Callback function type for hotkey handlers.

## Type Parameters

### TContext

`TContext` *extends* [`HotkeyCallbackContext`](HotkeyCallbackContext.md) = [`HotkeyCallbackContext`](HotkeyCallbackContext.md)

## Parameters

### event

`KeyboardEvent`

The keyboard event that triggered the hotkey

### context

`TContext`

The registered hotkey and its parsed form. APIs that take
one hotkey narrow it to chord or sequence context from the hotkey you pass.

## Returns

`void`

## Example

```ts
const handler: HotkeyCallback = (event, context) => {
  if (context.kind === 'chord') {
    console.log(context.hotkey, context.parsedChord.modifiers)
  } else {
    console.log(context.hotkey.join(' '), context.parsedSequence.length)
  }
}
```
