---
id: HotkeyController
title: HotkeyController
---

Defined in: [controllers/hotkey.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L74)

A Lit ReactiveController that registers a hotkey when the host element is
connected and unregisters it when the host is disconnected. The hotkey can
be a chord such as `'Mod+S'`, a sequence such as `['G', 'G']`, or an app
hotkey from `defineAppHotkeys`, which uses its custom hotkey from
`provideAppHotkeys`.

Chords accept `requireReset`; sequences accept `timeout`.

## Example

```ts
class MyElement extends LitElement {
  private save = new HotkeyController(this, 'Mod+S', () => this.doSave())
  private top = new HotkeyController(this, ['G', 'G'], () => this.scrollToTop())

  constructor() {
    super()
    this.addController(this.save)
    this.addController(this.top)
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeyController(
   host, 
   hotkey, 
   callback, 
   options?): HotkeyController;
```

Defined in: [controllers/hotkey.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L86)

#### Parameters

##### host

`ReactiveControllerHost`

The Lit component that owns this controller. Add the controller with `addController()`.

##### hotkey

`AppHotkey`

The chord, sequence, or app hotkey to register.

##### callback

`HotkeyCallback`

Called with the host as `this`.

##### options?

`MaybeGetter`\<[`AppHotkeyControllerOptions`](../type-aliases/AppHotkeyControllerOptions.md)\<`AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>\>\>

Options or a getter. Property getters are read on connection and after host updates.

#### Returns

`HotkeyController`

### Constructor

```ts
new HotkeyController(
   host, 
   hotkey, 
   callback, 
   options?): HotkeyController;
```

Defined in: [controllers/hotkey.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L92)

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

`RegisterableHotkey`

##### callback

`HotkeyCallback`

##### options?

`MaybeGetter`\<[`HotkeyControllerCommonOptions`](../type-aliases/HotkeyControllerCommonOptions.md)\>

#### Returns

`HotkeyController`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey.ts:108](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L108)

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

Defined in: [controllers/hotkey.ts:141](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L141)

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

Defined in: [controllers/hotkey.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L115)

Refreshes options after rendering, when scoped targets are available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdated
```
