---
id: HotkeySequenceRegistration
title: HotkeySequenceRegistration
---

Defined in: [hotkey-manager.ts:198](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L198)

A registered sequence in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeySequenceOptions`](HotkeySequenceOptions.md)\>

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:177](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L177)

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

Defined in: [hotkey-manager.ts:203](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L203)

Steps matched in the current attempt

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:185](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L185)

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

Defined in: [hotkey-manager.ts:200](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L200)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:175](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L175)

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

Defined in: [hotkey-manager.ts:199](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L199)

***

### lastKeyTime

```ts
lastKeyTime: number;
```

Defined in: [hotkey-manager.ts:205](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L205)

`Date.now()` when the last step in the current attempt matched

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:179](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L179)

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

Defined in: [hotkey-manager.ts:201](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L201)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:181](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L181)

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

Defined in: [hotkey-manager.ts:183](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L183)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
