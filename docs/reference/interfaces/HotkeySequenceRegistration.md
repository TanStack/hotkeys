---
id: HotkeySequenceRegistration
title: HotkeySequenceRegistration
---

Defined in: [hotkey-manager.ts:139](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L139)

A registered sequence in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeySequenceOptions`](HotkeySequenceOptions.md)\>

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:118](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L118)

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

Defined in: [hotkey-manager.ts:144](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L144)

Steps matched in the current attempt

***

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:126](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L126)

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

Defined in: [hotkey-manager.ts:141](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L141)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:116](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L116)

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

Defined in: [hotkey-manager.ts:140](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L140)

***

### lastKeyTime

```ts
lastKeyTime: number;
```

Defined in: [hotkey-manager.ts:146](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L146)

`Date.now()` when the last step in the current attempt matched

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:120](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L120)

Resolved options for this registration

#### Inherited from

```ts
RegistrationBase.options
```

***

### parsedSequence

```ts
parsedSequence: ParsedHotkey[];
```

Defined in: [hotkey-manager.ts:142](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L142)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:122](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L122)

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

Defined in: [hotkey-manager.ts:124](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L124)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
