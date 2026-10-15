---
id: HotkeyChordRegistration
title: HotkeyChordRegistration
---

Defined in: [hotkey-manager.ts:121](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L121)

A registered chord in the HotkeyManager.

## Extends

- `RegistrationBase`\<[`HotkeyChordOptions`](HotkeyChordOptions.md)\>

## Properties

### activeMatch?

```ts
optional activeMatch?: object;
```

Defined in: [hotkey-manager.ts:126](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L126)

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

Defined in: [hotkey-manager.ts:109](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L109)

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

Defined in: [hotkey-manager.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L117)

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

Defined in: [hotkey-manager.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L123)

***

### id

```ts
id: string;
```

Defined in: [hotkey-manager.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L107)

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

Defined in: [hotkey-manager.ts:122](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L122)

***

### options

```ts
options: HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:111](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L111)

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

Defined in: [hotkey-manager.ts:124](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L124)

***

### target

```ts
target: Target;
```

Defined in: [hotkey-manager.ts:113](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L113)

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

Defined in: [hotkey-manager.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L115)

How many times this registration's callback has been triggered

#### Inherited from

```ts
RegistrationBase.triggerCount
```
