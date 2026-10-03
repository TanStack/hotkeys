---
id: HotkeySequenceController
title: HotkeySequenceController
---

Defined in: [controllers/hotkey-sequence.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L26)

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
   callback,
   _options?): HotkeySequenceController;
```

Defined in: [controllers/hotkey-sequence.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L37)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller. Add the controller with `addController()`.

##### \_sequence

`HotkeySequence`

The sequence to register.

##### callback

`HotkeyCallback`

Called with the host as `this`.

##### \_options?

`SequenceOptions` \| (() => `SequenceOptions`)

Options or a getter. Property getters are read on connection and after host updates.

#### Returns

`HotkeySequenceController`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-sequence.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L49)

Registers when connected and a target is available.

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

Defined in: [controllers/hotkey-sequence.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L68)

Releases registrations when the host disconnects.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```

***

### hostUpdated()

```ts
hostUpdated(): void;
```

Defined in: [controllers/hotkey-sequence.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence.ts#L55)

Refreshes options after rendering, when scoped targets are available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdated
```
