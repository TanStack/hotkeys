---
id: HotkeySequenceRegistration
title: HotkeySequenceRegistration
---

Defined in: [hotkey-manager.ts:170](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L170)

A registered sequence in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeySequenceOptions`](HotkeySequenceOptions.md)\>

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:149](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L149)

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

Defined in: [hotkey-manager.ts:175](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L175)

Steps matched in the current attempt

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:157](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L157)

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

Defined in: [hotkey-manager.ts:172](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L172)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:147](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L147)

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

Defined in: [hotkey-manager.ts:171](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L171)

***

### lastKeyTime

```ts
lastKeyTime: number;
```

Defined in: [hotkey-manager.ts:177](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L177)

`Date.now()` when the last step in the current attempt matched

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:151](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L151)

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

Defined in: [hotkey-manager.ts:173](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L173)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:153](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L153)

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

Defined in: [hotkey-manager.ts:155](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L155)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
