---
id: HotkeyHintController
title: HotkeyHintController
---

Defined in: [controllers/hotkey-hint.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L16)

Modifier hint controller. Getter arguments can read reactive host properties.

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

Defined in: [controllers/hotkey-hint.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L21)

Attaches to the host; getter arguments can read changing reactive properties.

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| (() => RegisterableHotkey \| AppHotkey\<string, HotkeyChord \| HotkeySequence \| null\>)

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

Defined in: [controllers/hotkey-hint.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L31)

Current visibility; combine with the action’s enabled state when rendering.

##### Returns

`boolean`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-hint.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L36)

Subscribes on connection and requests renders only when hint visibility changes.

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

Defined in: [controllers/hotkey-hint.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L55)

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

Defined in: [controllers/hotkey-hint.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L50)

Re-evaluates getter arguments when host properties trigger an update.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdate
```
