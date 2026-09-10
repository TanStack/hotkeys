---
id: HotkeyController
title: HotkeyController
---

# Class: HotkeyController

Defined in: [controllers/hotkey.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L34)

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
   _callback, 
   _options): HotkeyController;
```

Defined in: [controllers/hotkey.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L44)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller (use `this` and pass it to `addController()`).

##### \_hotkey

`RegisterableHotkey`

The key or key combo to listen for (e.g. `'Mod+S'` or a raw hotkey object).

##### \_callback

`HotkeyCallback`

Function to run when the hotkey is pressed; called with the host as `this`.

##### \_options

`HotkeyOptions` = `HOTKEY_DEFAULT_OPTIONS`

Optional registration options (target, platform, enabled, etc.).

#### Returns

`HotkeyController`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L55)

Registers the hotkey with the global manager when the host is connected to the DOM.
Skips registration if no target is available (e.g. no document or options.target is null).

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

Defined in: [controllers/hotkey.ts:90](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L90)

Unregisters the hotkey when the host is disconnected from the DOM.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```
