---
id: CreateHotkeyDefinition
title: CreateHotkeyDefinition
---

```ts
type CreateHotkeyDefinition = 
  | {
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkeyChord>;
  options?: MaybeGetter<CreateHotkeyChordOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkeySequence>;
  options?: MaybeGetter<CreateHotkeySequenceOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeGetter<AppHotkey>;
  options?: MaybeGetter<CreateAppHotkeyOptions>;
}
  | {
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkey>;
  options?: MaybeGetter<CreateHotkeyOptions>;
};
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L34)

One hotkey for `createHotkeys`. The hotkey and options may be getters.
Chords accept `requireReset`; sequences accept `timeout`; hotkeys of unknown
kind accept only shared options.

## Union Members

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkeyChord>;
  options?: MaybeGetter<CreateHotkeyChordOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

The function to call when the hotkey is pressed

#### hotkey

```ts
hotkey: MaybeGetter<RegisterableHotkeyChord>;
```

A chord string such as `'Mod+S'`, or a chord object

#### options?

```ts
optional options?: MaybeGetter<CreateHotkeyChordOptions>;
```

Per-hotkey options (merged on top of commonOptions)

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkeySequence>;
  options?: MaybeGetter<CreateHotkeySequenceOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeGetter<RegisterableHotkeySequence>;
```

A sequence such as `['G', 'G']`, with each step a string or an object

#### options?

```ts
optional options?: MaybeGetter<CreateHotkeySequenceOptions>;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeGetter<AppHotkey>;
  options?: MaybeGetter<CreateAppHotkeyOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeGetter<AppHotkey>;
```

An app hotkey from `defineAppHotkeys`

#### options?

```ts
optional options?: MaybeGetter<CreateAppHotkeyOptions>;
```

***

### Type Literal

```ts
{
  callback: HotkeyCallback;
  hotkey: MaybeGetter<RegisterableHotkey>;
  options?: MaybeGetter<CreateHotkeyOptions>;
}
```

#### callback

```ts
callback: HotkeyCallback;
```

#### hotkey

```ts
hotkey: MaybeGetter<RegisterableHotkey>;
```

A hotkey whose kind is not known statically. Accepts only shared options.

#### options?

```ts
optional options?: MaybeGetter<CreateHotkeyOptions>;
```
