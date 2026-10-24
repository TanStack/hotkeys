---
id: HotkeyChordRegistration
title: HotkeyChordRegistration
---

Defined in: [hotkey-manager.ts:160](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L160)

A registered chord in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeyChordOptions`](HotkeyChordOptions.md)\>

## Properties

### activeMatch?

```ts
optional activeMatch?: object;
```

Defined in: [hotkey-manager.ts:165](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L165)

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

Defined in: [hotkey-manager.ts:148](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L148)

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

Defined in: [hotkey-manager.ts:156](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L156)

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

Defined in: [hotkey-manager.ts:162](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L162)

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
kind: "chord";
```

Defined in: [hotkey-manager.ts:161](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L161)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:150](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L150)

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

Defined in: [hotkey-manager.ts:163](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L163)

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
