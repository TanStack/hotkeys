---
id: HotkeyChordRegistration
title: HotkeyChordRegistration
---

Defined in: [hotkey-manager.ts:130](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L130)

A registered chord in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeyChordOptions`](HotkeyChordOptions.md)\>

## Properties

### activeMatch?

```ts
optional activeMatch?: object;
```

Defined in: [hotkey-manager.ts:135](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L135)

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

Defined in: [hotkey-manager.ts:118](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L118)

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

Defined in: [hotkey-manager.ts:126](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L126)

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

Defined in: [hotkey-manager.ts:132](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L132)

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
kind: "chord";
```

Defined in: [hotkey-manager.ts:131](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L131)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:120](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L120)

Resolved options for this registration

#### Inherited from

```ts
RegistrationBase.options
```

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-manager.ts:133](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L133)

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
