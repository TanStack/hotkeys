---
id: HotkeySequenceController
title: HotkeySequenceController
---

# Class: HotkeySequenceController

Defined in: [controllers/hotkey-sequence.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L28)

A Lit ReactiveController that registers a keyboard sequence (e.g. Vim-style)
when the host element is connected and unregisters it when the host is disconnected.

## Example

```ts
class MyElement extends LitElement {
  private seq = new HotkeySequenceController(this, ['G', 'G'], () => this.goToTop())

  constructor() {
    super()
    this.addController(this.seq)
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeySequenceController(
   _host, 
   _sequence, 
   _callback, 
   _options): HotkeySequenceController;
```

Defined in: [controllers/hotkey-sequence.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L38)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller (use `this` and pass it to `addController()`).

##### \_sequence

`HotkeySequence`

The key sequence to listen for (e.g. `['G', 'G']`).

##### \_callback

`HotkeyCallback`

Function to run when the sequence is completed; called with the host as `this`.

##### \_options

`SequenceOptions` = `HOTKEY_SEQUENCE_DEFAULT_OPTIONS`

Optional sequence options (target, timeout, enabled, etc.).

#### Returns

`HotkeySequenceController`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-sequence.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L49)

Registers the sequence with the global sequence manager when the host is connected to the DOM.
Skips registration if disabled, sequence is empty, or no target is available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostConnected
```

***

### hostDisconnected()

```ts
hostDisconnected(): void;
```

Defined in: [controllers/hotkey-sequence.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L76)

Unregisters the sequence when the host is disconnected from the DOM.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```
