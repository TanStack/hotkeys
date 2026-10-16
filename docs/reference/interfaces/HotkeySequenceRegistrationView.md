---
id: HotkeySequenceRegistrationView
title: HotkeySequenceRegistrationView
---

Defined in: [hotkey-manager.ts:173](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L173)

Public view of a sequence registration, without its callback.

## Extends

- `RegistrationViewBase`

## Properties

### hasFired

```ts
hasFired: boolean;
```

Defined in: [hotkey-manager.ts:161](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L161)

#### Inherited from

```ts
RegistrationViewBase.hasFired
```

***

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey-manager.ts:175](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L175)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:158](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L158)

#### Inherited from

```ts
RegistrationViewBase.id
```

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-manager.ts:174](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L174)

***

### matchedStepCount

```ts
matchedStepCount: number;
```

Defined in: [hotkey-manager.ts:179](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L179)

Steps matched in the current attempt (0 when idle or just completed).

***

### options

```ts
options: HotkeySequenceOptions;
```

Defined in: [hotkey-manager.ts:177](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L177)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkey[];
```

Defined in: [hotkey-manager.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L176)

***

### partialMatchLastKeyTime

```ts
partialMatchLastKeyTime: number;
```

Defined in: [hotkey-manager.ts:181](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L181)

`Date.now()` when the last step in the current attempt matched; 0 if none.

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:159](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L159)

#### Inherited from

```ts
RegistrationViewBase.target
```

***

### triggerCount

```ts
triggerCount: number;
```

Defined in: [hotkey-manager.ts:160](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L160)

#### Inherited from

```ts
RegistrationViewBase.triggerCount
```
