---
id: HotkeyController
title: HotkeyController
---

Defined in: [controllers/hotkey.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L26)

A Lit ReactiveController that registers a keyboard hotkey when the host
element is connected and unregisters it when the host is disconnected.

## Example

```ts
class MyElement extends LitElement {
  private hotkey = new HotkeyController(this, 'Mod+S', () => this.save())

  constructor() {
    super()
    this.addController(this.hotkey)
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeyController(
   _host,
   _hotkey,
   callback,
   _options?): HotkeyController;
```

Defined in: [controllers/hotkey.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L37)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller. Add the controller with `addController()`.

##### \_hotkey

`RegisterableHotkey`

The shortcut to register.

##### callback

`HotkeyCallback`

Called with the host as `this`.

##### \_options?

`HotkeyOptions` \| (() => `HotkeyOptions`)

Options or a getter. Property getters are read on connection and after host updates.

#### Returns

`HotkeyController`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L48)

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

Defined in: [controllers/hotkey.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L67)

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

Defined in: [controllers/hotkey.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L54)

Refreshes options after rendering, when scoped targets are available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdated
```
