---
id: HotkeySequenceRegistrationView
title: HotkeySequenceRegistrationView
---

Defined in: [hotkey-manager.ts:215](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L215)

Public view of a sequence registration, without its callback.

## Extends

- `RegistrationViewBase`

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:203](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L203)

#### Inherited from

```ts
RegistrationViewBase.hasFired
```

***

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey-manager.ts:217](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L217)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:198](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L198)

#### Inherited from

```ts
RegistrationViewBase.id
```

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-manager.ts:216](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L216)

***

### matchedStepCount

```ts
matchedStepCount: number;
```

Defined in: [hotkey-manager.ts:221](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L221)

Steps matched in the current attempt (0 when idle or just completed).

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:219](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L219)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-manager.ts:218](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L218)

***

### partialMatchLastKeyTime

```ts
partialMatchLastKeyTime: number;
```

Defined in: [hotkey-manager.ts:223](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L223)

`Date.now()` when the last step in the current attempt matched; 0 if none.

***

### status

```ts
status: HotkeyRegistrationStatus;
```

Defined in: [hotkey-manager.ts:200](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L200)

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

Defined in: [hotkey-manager.ts:201](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L201)

#### Inherited from

```ts
RegistrationViewBase.target
```

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:202](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L202)

#### Inherited from

```ts
RegistrationViewBase.triggerCount
```
