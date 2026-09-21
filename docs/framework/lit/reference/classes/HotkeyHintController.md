---
id: HotkeyHintController
title: HotkeyHintController
---

Defined in: [controllers/hotkey-hint.ts:6](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L6)

Modifier hint controller. Getter arguments can read reactive host properties.

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeyHintController(
   host, 
   hotkey, 
   options): HotkeyHintController;
```

Defined in: [controllers/hotkey-hint.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L11)

Attaches to the host; getter arguments can read changing reactive properties.

#### Parameters

##### host

`ReactiveControllerHost`

##### hotkey

`RegisterableHotkey` | () => `RegisterableHotkey`

##### options

`HeldModifierOptions` | () => `HeldModifierOptions`

#### Returns

`HotkeyHintController`

## Accessors

### value

#### Get Signature

```ts
get value(): boolean;
```

Defined in: [controllers/hotkey-hint.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L20)

Current visibility; combine with the action’s enabled state when rendering.

##### Returns

`boolean`

## Methods

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-hint.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L25)

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

Defined in: [controllers/hotkey-hint.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L39)

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

Defined in: [controllers/hotkey-hint.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-hint.ts#L34)

Re-evaluates getter arguments when host properties trigger an update.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostUpdate
```
