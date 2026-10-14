---
id: AdapterHotkeyDefinition
title: AdapterHotkeyDefinition
---

```ts
type AdapterHotkeyDefinition<TTarget> = 
  | {
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeyChord;
  options?: AdapterChordOptions<TTarget>;
}
  | {
  callback: HotkeyCallback;
  hotkey: HotkeySequence;
  options?: AdapterSequenceOptions<TTarget>;
}
  | {
  callback: HotkeyCallback;
  hotkey: AppHotkey;
  options?: Omit<AdapterCommonOptions<TTarget>, "meta">;
}
  | {
  callback: HotkeyCallback;
  hotkey: RegisterableHotkey;
  options?: AdapterHotkeyOptions<TTarget>;
};
```

Defined in: [adapter.ts:223](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L223)

One hotkey and its callback for adapter APIs such as `useHotkeys`. Chords
accept `requireReset`; sequences accept `timeout`; hotkeys of unknown kind
accept only shared options.

## Type Parameters

### TTarget

`TTarget`

## Union Members

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeyChord;
  options?: AdapterChordOptions<TTarget>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

The function to call when the hotkey is pressed

#### hotkey

```ts
hotkey: RegisterableHotkeyChord;
```

A chord string such as `'Mod+S'`, or a RawHotkey object

#### options?

```ts
optional options?: AdapterChordOptions<TTarget>;
```

Per-hotkey options (merged on top of common options)

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: HotkeySequence;
  options?: AdapterSequenceOptions<TTarget>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: HotkeySequence;
```

A sequence such as `['G', 'G']`

#### options?

```ts
optional options?: AdapterSequenceOptions<TTarget>;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: AppHotkey;
  options?: Omit<AdapterCommonOptions<TTarget>, "meta">;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: AppHotkey;
```

An app hotkey from `defineAppHotkeys`. Kind-specific options apply
only while its effective hotkey has that kind.

#### options?

```ts
optional options?: Omit<AdapterCommonOptions<TTarget>, "meta">;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: RegisterableHotkey;
  options?: AdapterHotkeyOptions<TTarget>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: RegisterableHotkey;
```

A hotkey whose kind is not known statically, such as user data typed
`Hotkey`. Accepts only shared options.

#### options?

```ts
optional options?: AdapterHotkeyOptions<TTarget>;
```
