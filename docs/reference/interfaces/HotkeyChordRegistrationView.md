---
id: HotkeyChordRegistrationView
title: HotkeyChordRegistrationView
---

Defined in: [hotkey-manager.ts:202](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L202)

Public view of a chord registration, without its callback.

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
hotkey: HotkeyChord;
```

Defined in: [hotkey-manager.ts:204](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L204)

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
kind: "chord";
```

Defined in: [hotkey-manager.ts:203](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L203)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:206](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L206)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-manager.ts:205](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L205)

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
