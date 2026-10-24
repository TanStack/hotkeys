---
id: HotkeySequenceRegistration
title: HotkeySequenceRegistration
---

Defined in: [hotkey-manager.ts:169](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L169)

A registered sequence in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeySequenceOptions`](HotkeySequenceOptions.md)\>

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:148](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L148)

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

Defined in: [hotkey-manager.ts:174](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L174)

Steps matched in the current attempt

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:156](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L156)

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

Defined in: [hotkey-manager.ts:171](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L171)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:146](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L146)

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

Defined in: [hotkey-manager.ts:170](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L170)

***

### lastKeyTime

```ts
lastKeyTime: number;
```

Defined in: [hotkey-manager.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L176)

`Date.now()` when the last step in the current attempt matched

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:150](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L150)

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

Defined in: [hotkey-manager.ts:172](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L172)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:152](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L152)

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

Defined in: [hotkey-manager.ts:154](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L154)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
