---
id: HotkeySequenceRegistrationView
title: HotkeySequenceRegistrationView
---

Defined in: [hotkey-manager.ts:210](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L210)

Public view of a sequence registration, without its callback.

## Extends

- `RegistrationViewBase`

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:198](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L198)

#### Inherited from

```ts
RegistrationViewBase.hasFired
```

***

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey-manager.ts:212](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L212)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:193](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L193)

#### Inherited from

```ts
RegistrationViewBase.id
```

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-manager.ts:211](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L211)

***

### matchedStepCount

```ts
matchedStepCount: number;
```

Defined in: [hotkey-manager.ts:216](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L216)

Steps matched in the current attempt (0 when idle or just completed).

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:214](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L214)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-manager.ts:213](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L213)

***

### partialMatchLastKeyTime

```ts
partialMatchLastKeyTime: number;
```

Defined in: [hotkey-manager.ts:218](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L218)

`Date.now()` when the last step in the current attempt matched; 0 if none.

***

### status

```ts
status: HotkeyRegistrationStatus;
```

Defined in: [hotkey-manager.ts:195](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L195)

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

Defined in: [hotkey-manager.ts:196](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L196)

#### Inherited from

```ts
RegistrationViewBase.target
```

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:197](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L197)

#### Inherited from

```ts
RegistrationViewBase.triggerCount
```
