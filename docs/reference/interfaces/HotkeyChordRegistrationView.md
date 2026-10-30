---
id: HotkeyChordRegistrationView
title: HotkeyChordRegistrationView
---

Defined in: [hotkey-manager.ts:207](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L207)

Public view of a chord registration, without its callback.

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
hotkey: HotkeyChord;
```

Defined in: [hotkey-manager.ts:209](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L209)

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
kind: "chord";
```

Defined in: [hotkey-manager.ts:208](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L208)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:211](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L211)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-manager.ts:210](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L210)

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
