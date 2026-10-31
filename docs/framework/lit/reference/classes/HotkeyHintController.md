---
id: HotkeyHintController
title: HotkeyHintController
---

Defined in: [controllers/hotkey-hint.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L21)

Modifier hint controller. Getter arguments can read reactive host
properties. No hotkey (`undefined`, `null`, or `''`) is never visible.

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeyHintController(
   host, 
   hotkey, 
   options?): HotkeyHintController;
```

Defined in: [controllers/hotkey-hint.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L26)

Attaches to the host; getter arguments can read changing reactive properties.

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| (() => RegisterableHotkey \| AppHotkey\<string, HotkeyChord \| HotkeySequence \| null\> \| null \| undefined)
  \| `null`
  \| `undefined`

##### options?

`HeldModifierOptions` \| (() => `HeldModifierOptions`)

#### Returns

`HotkeyHintController`

## Accessors

### value

#### Get Signature

```ts
get value(): boolean;
```

Defined in: [controllers/hotkey-hint.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L43)

Current visibility. True only while the hotkey can fire: some registration
of it is enabled and in an active scope. A hotkey on an element counts only while focus is inside it.

##### Returns

`boolean`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-hint.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L52)

Subscribes on connection, then requests renders only when hint visibility
changes. Reconnecting always requests one, since the hint may have changed
while disconnected.

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

Defined in: [controllers/hotkey-hint.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L75)

Releases the subscription and clears cached visibility while disconnected.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```

***

### hostUpdate()

```ts
hostUpdate(): void;
```

Defined in: [controllers/hotkey-hint.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L70)

Re-evaluates getter arguments when host properties trigger an update.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdate
```
