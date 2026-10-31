---
id: HotkeyDefinition
title: HotkeyDefinition
---

```ts
type HotkeyDefinition = 
  | {
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeyChord;
  options?: HotkeyChordOptions;
}
  | {
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeySequence;
  options?: HotkeySequenceOptions;
}
  | {
  callback: HotkeyCallback;
  hotkey: null | undefined;
  options?: HotkeyChordOptions & HotkeySequenceOptions;
};
```

Defined in: [adapter.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L41)

A hotkey and its callback, with optional per-binding options. Chords accept
`requireReset`; sequences accept `timeout`.

## Union Members

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeyChord;
  options?: HotkeyChordOptions;
}
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeySequence;
  options?: HotkeySequenceOptions;
}
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: null | undefined;
  options?: HotkeyChordOptions & HotkeySequenceOptions;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: null | undefined;
```

No hotkey. Registers nothing.

#### options?

```ts
optional options?: HotkeyChordOptions & HotkeySequenceOptions;
```
