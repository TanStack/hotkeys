---
id: HotkeyController
title: HotkeyController
---

Defined in: [controllers/hotkey.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L70)

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

Defined in: [controllers/hotkey.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L82)

#### Parameters

##### host

`ReactiveControllerHost`

The Lit component that owns this controller. The controller adds itself to it.

##### hotkey

`MaybeGetter`\<
  \| `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>
  \| `null`
  \| `undefined`\>

The chord, sequence, or app hotkey to register, or a getter. A getter is read on connection and after host updates. `undefined`, `null`, or `''` registers nothing, for an optional shortcut.

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

Defined in: [controllers/hotkey.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L88)

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

`MaybeGetter`\<`RegisterableHotkey` \| `null` \| `undefined`\>

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

Defined in: [controllers/hotkey.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L107)

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

Defined in: [controllers/hotkey.ts:146](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L146)

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

Defined in: [controllers/hotkey.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey.ts#L117)

Refreshes options after rendering, when scoped targets are available.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdated
```
