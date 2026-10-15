---
id: HotkeyController
title: HotkeyController
---

Defined in: [controllers/hotkey.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L75)

A Lit ReactiveController that registers a hotkey when the host element is
connected and unregisters it when the host is disconnected. The hotkey can
be a chord such as `'Mod+S'`, a sequence such as `['G', 'G']`, or an app
hotkey from `defineAppHotkeys`, which uses its custom hotkey from
`provideAppHotkeys`.

Chords accept `requireReset`; sequences accept `timeout`. Pass a getter for
the hotkey or options to re-read them after each host update.

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

Defined in: [controllers/hotkey.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L87)

#### Parameters

##### host

`ReactiveControllerHost`

The Lit component that owns this controller. Add the controller with `addController()`.

##### hotkey

`MaybeGetter`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>

The chord, sequence, or app hotkey to register, or a getter. A getter is read on connection and after host updates.

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

Defined in: [controllers/hotkey.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L93)

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

`MaybeGetter`\<`RegisterableHotkey`\>

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

Defined in: [controllers/hotkey.ts:109](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L109)

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

Defined in: [controllers/hotkey.ts:145](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L145)

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

Defined in: [controllers/hotkey.ts:116](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L116)

Refreshes options after rendering, when scoped targets are available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdated
```
