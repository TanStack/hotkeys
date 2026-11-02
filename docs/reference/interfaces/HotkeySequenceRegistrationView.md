---
id: HotkeySequenceRegistrationView
title: HotkeySequenceRegistrationView
---

Defined in: [hotkey-manager.ts:239](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L239)

Public view of a sequence registration, without its callback.

## Extends

- `RegistrationViewBase`

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:227](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L227)

#### Inherited from

```ts
RegistrationViewBase.hasFired
```

***

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey-manager.ts:241](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L241)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:222](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L222)

#### Inherited from

```ts
RegistrationViewBase.id
```

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-manager.ts:240](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L240)

***

### matchedStepCount

```ts
matchedStepCount: number;
```

Defined in: [hotkey-manager.ts:245](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L245)

Steps matched in the current attempt (0 when idle or just completed).

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:243](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L243)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-manager.ts:242](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L242)

***

### partialMatchLastKeyTime

```ts
partialMatchLastKeyTime: number;
```

Defined in: [hotkey-manager.ts:247](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L247)

`Date.now()` when the last step in the current attempt matched; 0 if none.

***

### status

```ts
status: HotkeyRegistrationStatus;
```

Defined in: [hotkey-manager.ts:224](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L224)

Whether the registration is enabled and in an active scope.

#### Inherited from

```ts
RegistrationViewBase.status
```

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:225](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L225)

#### Inherited from

```ts
RegistrationViewBase.target
```

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:226](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L226)

#### Inherited from

```ts
RegistrationViewBase.triggerCount
```
