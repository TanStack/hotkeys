---
id: HotkeyChordRegistration
title: HotkeyChordRegistration
---

Defined in: [hotkey-manager.ts:189](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L189)

A registered chord in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeyChordOptions`](HotkeyChordOptions.md)\>

## Properties

### activeMatch?

```ts
optional activeMatch?: object;
```

Defined in: [hotkey-manager.ts:194](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L194)

The concrete key/code that activated a requireReset registration.

#### code

```ts
code: string;
```

#### key

```ts
key: string;
```

***

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
hotkey: HotkeyChord;
```

Defined in: [hotkey-manager.ts:191](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L191)

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
kind: "chord";
```

Defined in: [hotkey-manager.ts:190](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L190)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:179](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L179)

Resolved options for this registration

#### Inherited from

```ts
RegistrationBase.options
```

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-manager.ts:192](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L192)

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
