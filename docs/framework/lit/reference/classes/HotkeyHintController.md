---
id: HotkeyHintController
title: HotkeyHintController
---

Defined in: [controllers/hotkey-hint.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L17)

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

Defined in: [controllers/hotkey-hint.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L22)

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

Defined in: [controllers/hotkey-hint.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L35)

Current visibility. True only while the hotkey can fire: some registration
of it is enabled and in an active scope. Focus and `target` are not checked.

##### Returns

`boolean`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-hint.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L44)

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

Defined in: [controllers/hotkey-hint.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L66)

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

Defined in: [controllers/hotkey-hint.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L61)

Re-evaluates getter arguments when host properties trigger an update.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdate
```
