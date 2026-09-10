---
id: hotkeySequence
title: hotkeySequence
---

# Function: hotkeySequence()

```ts
function hotkeySequence(sequence, options): <T>(proto, methodName, descriptor) => void;
```

Defined in: [decorators/hotkey-sequence.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey-sequence.ts#L30)

Decorator that registers a keyboard sequence (e.g. Vim-style) on the element
when it connects and unregisters when it disconnects. Uses
[HotkeySequenceController](../classes/HotkeySequenceController.md) under the hood.

## Parameters

### sequence

`HotkeySequence`

The key sequence to listen for (e.g. `['G', 'G']` for "g g").

### options

`SequenceOptions` = `HOTKEY_SEQUENCE_DEFAULT_OPTIONS`

Optional sequence options (target, timeout, enabled, etc.).

## Returns

A method decorator for use on LitElement methods.

```ts
<T>(
   proto, 
   methodName, 
   descriptor): void;
```

### Type Parameters

#### T

`T` *extends* `HotkeyCallback`

### Parameters

#### proto

`LitElement`

#### methodName

`string`

#### descriptor

`TypedPropertyDescriptor`\<`T`\>

### Returns

`void`

## Example

```ts
class MyElement extends LitElement {
  @hotkeySequence(['G', 'G'])
  goToTop() { window.scrollTo(0, 0) }

  @hotkeySequence(['D', 'D'], { timeout: 500 })
  deleteLine() { this.deleteCurrentLine() }
}
```
