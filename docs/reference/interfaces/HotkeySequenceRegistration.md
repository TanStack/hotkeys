---
id: HotkeySequenceRegistration
title: HotkeySequenceRegistration
---

Defined in: [hotkey-manager.ts:186](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L186)

A registered sequence in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeySequenceOptions`](HotkeySequenceOptions.md)\>

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:165](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L165)

The callback to invoke

#### Inherited from

```ts
RegistrationBase.callback
```

***

### currentIndex

```ts
currentIndex: number;
```

Defined in: [hotkey-manager.ts:191](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L191)

Steps matched in the current attempt

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:173](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L173)

Whether this registration has fired (and, for requireReset chords, needs a reset)

#### Inherited from

```ts
RegistrationBase.hasFired
```

***

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey-manager.ts:188](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L188)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:163](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L163)

Unique identifier for this registration

#### Inherited from

```ts
RegistrationBase.id
```

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-manager.ts:187](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L187)

***

### lastKeyTime

```ts
lastKeyTime: number;
```

Defined in: [hotkey-manager.ts:193](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L193)

`Date.now()` when the last step in the current attempt matched

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:167](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L167)

Resolved options for this registration

#### Inherited from

```ts
RegistrationBase.options
```

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-manager.ts:189](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L189)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:169](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L169)

The resolved target element for this registration

#### Inherited from

```ts
RegistrationBase.target
```

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:171](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L171)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
